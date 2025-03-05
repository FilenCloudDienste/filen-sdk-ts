import type FilenSDK from ".."
import { type FolderMetadata, type FileMetadata, type FileEncryptionVersion, type ProgressCallback, type Prettify } from "../types"
import pathModule from "path"
import { ENOENT } from "./errors"
import { BUFFER_SIZE, environment } from "../constants"
import { type PauseSignal } from "../cloud/signals"
import fs from "fs-extra"
import { uuidv4, normalizePath, replacePathStartWithFromAndTo } from "../utils"
import os from "os"
import { type CloudItem } from "../cloud"
import { Socket, type SocketEvent } from "../socket"
import { Semaphore } from "../semaphore"
import writeFileAtomic from "write-file-atomic"

export type FSConfig = {
	sdk: FilenSDK
	connectToSocket?: boolean
}

export type FSItemType = "file" | "directory"

export type FSItemBase = {
	uuid: string
}

export type FSItemFileBase = {
	region: string
	bucket: string
	version: FileEncryptionVersion
	chunks: number
}

export type FSItemFileMetadata = Prettify<FSItemFileBase & FileMetadata>

export type FSItem = Prettify<
	| (FSItemBase & {
			type: "directory"
			metadata: FolderMetadata & { timestamp: number }
	  })
	| (FSItemBase & {
			type: "file"
			metadata: FSItemFileMetadata
	  })
>

export type FSItems = Record<string, FSItem>

export type FSStatsBase = {
	size: number
	mtimeMs: number
	birthtimeMs: number
	isDirectory: () => boolean
	isFile: () => boolean
}

export type FSStats = Prettify<
	| (FolderMetadata &
			FSStatsBase & {
				type: "directory"
				uuid: string
			})
	| (FSItemFileBase &
			FileMetadata &
			FSStatsBase & {
				type: "file"
				uuid: string
			})
>

export type StatFS = {
	type: number
	bsize: number
	blocks: number
	bfree: number
	bavail: number
	files: number
	ffree: number
	used: number
	max: number
}

export type FSItemUUID = FSItem & { path: string }

/**
 * FS
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class FS
 * @typedef {FS}
 */
export class FS {
	private readonly sdk: FilenSDK
	private readonly connectToSocket: boolean
	public _items: FSItems
	public _uuidToItem: Record<string, FSItemUUID>
	private readonly socket = new Socket()
	private readonly mutex = new Semaphore(1)
	private readonly mkdirMutex = new Semaphore(1)
	private readonly itemsMutex = new Semaphore(1)

	public constructor(params: FSConfig) {
		this.sdk = params.sdk
		this.connectToSocket = params.connectToSocket ?? false

		this._items = {
			"/": {
				uuid: this.sdk.config.baseFolderUUID!,
				type: "directory",
				metadata: {
					name: "Cloud Drive",
					timestamp: Date.now()
				}
			}
		}

		this._uuidToItem = {
			[this.sdk.config.baseFolderUUID!]: {
				uuid: this.sdk.config.baseFolderUUID!,
				type: "directory",
				path: "/",
				metadata: {
					name: "Cloud Drive",
					timestamp: Date.now()
				}
			}
		}

		this._initSocketEvents(params.connectToSocket).catch(() => {})
	}

	/**
	 * Wait for an API key (login) to become available
	 *
	 * @private
	 * @async
	 * @returns {Promise<string>}
	 */
	private async waitForValidAPIKey(): Promise<string> {
		if (this.sdk.config.apiKey && this.sdk.config.apiKey.length >= 16 && this.sdk.config.apiKey !== "anonymous") {
			return this.sdk.config.apiKey
		}

		return await new Promise<string>(resolve => {
			const interval = setInterval(() => {
				if (this.sdk.config.apiKey && this.sdk.config.apiKey.length >= 16 && this.sdk.config.apiKey !== "anonymous") {
					clearInterval(interval)

					resolve(this.sdk.config.apiKey)
				}
			}, 250)
		})
	}

	/**
	 * Attach listeners for relevant realtime events.
	 *
	 * @private
	 * @async
	 * @param {?boolean} [connect]
	 * @returns {Promise<void>}
	 */
	private async _initSocketEvents(connect?: boolean): Promise<void> {
		if (!connect) {
			return
		}

		const apiKey = await this.waitForValidAPIKey()

		this.socket.connect({
			apiKey
		})

		this.socket.addListener("socketEvent", async (event: SocketEvent) => {
			await this.itemsMutex.acquire()

			try {
				if (event.type === "fileArchiveRestored") {
					const currentItem = this._uuidToItem[event.data.currentUUID]
					const item = this._uuidToItem[event.data.uuid]

					if (currentItem) {
						delete this._items[currentItem.path]
						delete this._uuidToItem[event.data.currentUUID]
					}

					if (item) {
						delete this._items[item.path]
						delete this._uuidToItem[event.data.uuid]
					}
				} else if (event.type === "fileRename") {
					const item = this._uuidToItem[event.data.uuid]

					if (item) {
						delete this._items[item.path]
						delete this._uuidToItem[event.data.uuid]
					}
				} else if (event.type === "fileMove") {
					const item = this._uuidToItem[event.data.uuid]

					if (item) {
						delete this._items[item.path]
						delete this._uuidToItem[event.data.uuid]
					}
				} else if (event.type === "fileTrash") {
					const item = this._uuidToItem[event.data.uuid]

					if (item) {
						delete this._items[item.path]
						delete this._uuidToItem[event.data.uuid]
					}
				} else if (event.type === "fileArchived") {
					const item = this._uuidToItem[event.data.uuid]

					if (item) {
						delete this._items[item.path]
						delete this._uuidToItem[event.data.uuid]
					}
				} else if (event.type === "folderTrash") {
					const item = this._uuidToItem[event.data.uuid]

					if (item) {
						for (const path in this._items) {
							if (path.startsWith(item.path + "/") || item.path === path) {
								const oldItem = this._items[path]

								if (oldItem) {
									delete this._uuidToItem[oldItem.uuid]
								}

								delete this._items[path]
							}
						}

						delete this._items[item.path]
						delete this._uuidToItem[event.data.uuid]
					}
				} else if (event.type === "fileDeletedPermanent") {
					const item = this._uuidToItem[event.data.uuid]

					if (item) {
						delete this._items[item.path]
						delete this._uuidToItem[event.data.uuid]
					}
				} else if (event.type === "folderMove") {
					const item = this._uuidToItem[event.data.uuid]

					if (item) {
						for (const path in this._items) {
							if (path.startsWith(item.path + "/") || item.path === path) {
								const oldItem = this._items[path]

								if (oldItem) {
									delete this._uuidToItem[oldItem.uuid]
								}

								delete this._items[path]
							}
						}

						delete this._items[item.path]
						delete this._uuidToItem[event.data.uuid]
					}
				} else if (event.type === "folderRename") {
					const item = this._uuidToItem[event.data.uuid]

					if (item) {
						for (const path in this._items) {
							if (path.startsWith(item.path + "/") || item.path === path) {
								const oldItem = this._items[path]

								if (oldItem) {
									delete this._uuidToItem[oldItem.uuid]
								}

								delete this._items[path]
							}
						}

						delete this._items[item.path]
						delete this._uuidToItem[event.data.uuid]
					}
				} else if (event.type === "passwordChanged") {
					this._items = {}
					this._uuidToItem = {}
				}
			} catch {
				// Noop
			} finally {
				this.itemsMutex.release()
			}
		})
	}

	/**
	 * Add an item to the internal item tree.
	 *
	 * @public
	 * @async
	 * @param {{ path: string; item: FSItem }} param0
	 * @param {string} param0.path
	 * @param {(Prettify<(FSItemBase & { type: "directory"; metadata: FolderMetadata; }) | (FSItemBase & { type: "file"; metadata: Prettify<any>; })>)} param0.item
	 * @returns {Promise<void>}
	 */
	public async _addItem({ path, item }: { path: string; item: FSItem }): Promise<void> {
		await this.itemsMutex.acquire()

		this._items[path] = item
		this._uuidToItem[item.uuid] = {
			...item,
			path
		}

		this.itemsMutex.release()
	}

	/**
	 * Remove an item from the internal item tree.
	 *
	 * @public
	 * @async
	 * @param {{ path: string }} param0
	 * @param {string} param0.path
	 * @returns {Promise<void>}
	 */
	public async _removeItem({ path }: { path: string }): Promise<void> {
		await this.itemsMutex.acquire()

		for (const entry in this._items) {
			if (entry.startsWith(path + "/") || entry === path) {
				const item = this._items[entry]

				if (item) {
					delete this._uuidToItem[item.uuid]
				}

				delete this._items[entry]
			}
		}

		this.itemsMutex.release()
	}

	/**
	 * Normalizes a path to be used with FS.
	 * @date 2/14/2024 - 12:50:52 AM
	 *
	 * @private
	 * @param {{ path: string }} param0
	 * @param {string} param0.path
	 * @returns {string}
	 */
	private normalizePath({ path }: { path: string }): string {
		path = pathModule.posix.normalize(path)

		if (path.endsWith("/")) {
			path = path.substring(0, path.length - 1)
		}

		if (!path.startsWith("/")) {
			path = "/" + path
		}

		return path
	}

	public async pathToItemUUID({ path, type }: { path: string; type?: FSItemType }): Promise<string | null> {
		path = this.normalizePath({
			path
		})

		const acceptedTypes: FSItemType[] = !type ? ["directory", "file"] : type === "directory" ? ["directory"] : ["file"]

		if (path === "/") {
			return this.sdk.config.baseFolderUUID!
		}

		const item = this._items[path]

		if (item && acceptedTypes.includes(item.type)) {
			return item.uuid
		}

		const pathEx = path.split("/")
		let builtPath = "/"

		for (const part of pathEx) {
			if (pathEx.length <= 0) {
				continue
			}

			builtPath = pathModule.posix.join(builtPath, part)

			const parentDirname = pathModule.posix.dirname(builtPath)
			const parentItem = this._items[parentDirname]

			if (!parentItem) {
				return null
			}

			const content = await this.sdk.cloud().listDirectory({
				uuid: parentItem.uuid
			})
			let foundUUID = ""
			let foundType: FSItemType | null = null

			for (const item of content) {
				const itemPath = pathModule.posix.join(parentDirname, item.name)

				if (itemPath === path) {
					foundUUID = item.uuid
					foundType = item.type
				}

				await this.itemsMutex.acquire()

				if (item.type === "directory") {
					this._items[itemPath] = {
						uuid: item.uuid,
						type: "directory",
						metadata: {
							name: item.name,
							timestamp: item.timestamp
						}
					}

					this._uuidToItem[item.uuid] = {
						uuid: item.uuid,
						type: "directory",
						path: itemPath,
						metadata: {
							name: item.name,
							timestamp: item.timestamp
						}
					}
				} else {
					this._items[itemPath] = {
						uuid: item.uuid,
						type: "file",
						metadata: {
							name: item.name,
							size: item.size,
							mime: item.mime,
							key: item.key,
							lastModified: item.lastModified,
							chunks: item.chunks,
							region: item.region,
							bucket: item.bucket,
							version: item.version
						}
					}

					this._uuidToItem[item.uuid] = {
						uuid: item.uuid,
						type: "file",
						path: itemPath,
						metadata: {
							name: item.name,
							size: item.size,
							mime: item.mime,
							key: item.key,
							lastModified: item.lastModified,
							chunks: item.chunks,
							region: item.region,
							bucket: item.bucket,
							version: item.version
						}
					}
				}

				this.itemsMutex.release()
			}

			if (foundType && foundUUID.length > 0 && acceptedTypes.includes(foundType)) {
				return foundUUID
			}
		}

		const foundItem = this._items[path]

		if (foundItem && acceptedTypes.includes(foundItem.type)) {
			return foundItem.uuid
		}

		return null
	}

	/**
	 * List files and directories at path.
	 * @date 2/20/2024 - 2:40:03 AM
	 *
	 * @public
	 * @async
	 * @param {{ path: string, recursive?: boolean }} param0
	 * @param {string} param0.path
	 * @param {boolean} [param0.recursive=false]
	 * @returns {Promise<string[]>}
	 */
	public async readdir({ path, recursive = false }: { path: string; recursive?: boolean }): Promise<string[]> {
		path = this.normalizePath({ path })

		const uuid = await this.pathToItemUUID({
			path,
			type: "directory"
		})

		if (!uuid) {
			throw new ENOENT({ path })
		}

		const names: string[] = []
		const existingPaths: Record<string, boolean> = {}

		if (recursive) {
			const tree = await this.sdk.cloud().getDirectoryTree({
				uuid
			})

			for (const entry in tree) {
				const item = tree[entry]
				const entryPath = entry.startsWith("/") ? entry.substring(1) : entry
				const lowercasePath = entryPath.toLowerCase()

				if (!item || item.parent === "base" || existingPaths[lowercasePath]) {
					continue
				}

				existingPaths[lowercasePath] = true

				const itemPath = pathModule.posix.join(path, entryPath)

				names.push(entryPath)

				await this.itemsMutex.acquire()

				if (item.type === "directory") {
					this._items[itemPath] = {
						uuid: item.uuid,
						type: "directory",
						metadata: {
							name: item.name,
							timestamp: item.timestamp
						}
					}

					this._uuidToItem[item.uuid] = {
						uuid: item.uuid,
						type: "directory",
						path: itemPath,
						metadata: {
							name: item.name,
							timestamp: item.timestamp
						}
					}
				} else {
					this._items[itemPath] = {
						uuid: item.uuid,
						type: "file",
						metadata: {
							name: item.name,
							size: item.size,
							mime: item.mime,
							key: item.key,
							lastModified: item.lastModified,
							chunks: item.chunks,
							region: item.region,
							bucket: item.bucket,
							version: item.version
						}
					}

					this._uuidToItem[item.uuid] = {
						uuid: item.uuid,
						type: "file",
						path: itemPath,
						metadata: {
							name: item.name,
							size: item.size,
							mime: item.mime,
							key: item.key,
							lastModified: item.lastModified,
							chunks: item.chunks,
							region: item.region,
							bucket: item.bucket,
							version: item.version
						}
					}
				}

				this.itemsMutex.release()
			}

			return names.sort((a, b) =>
				a.toLowerCase().localeCompare(b.toLowerCase(), "en", {
					numeric: true
				})
			)
		}

		const items = (
			await this.sdk.cloud().listDirectory({
				uuid
			})
		).sort((a, b) =>
			a.name.toLowerCase().localeCompare(b.name.toLowerCase(), "en", {
				numeric: true
			})
		)

		for (const item of items) {
			const itemPath = pathModule.posix.join(path, item.name)
			const lowercasePath = itemPath.toLowerCase()

			if (existingPaths[lowercasePath]) {
				continue
			}

			existingPaths[lowercasePath] = true

			names.push(item.name)

			await this.itemsMutex.acquire()

			if (item.type === "directory") {
				this._items[itemPath] = {
					uuid: item.uuid,
					type: "directory",
					metadata: {
						name: item.name,
						timestamp: item.timestamp
					}
				}

				this._uuidToItem[item.uuid] = {
					uuid: item.uuid,
					type: "directory",
					path: itemPath,
					metadata: {
						name: item.name,
						timestamp: item.timestamp
					}
				}
			} else {
				this._items[itemPath] = {
					uuid: item.uuid,
					type: "file",
					metadata: {
						name: item.name,
						size: item.size,
						mime: item.mime,
						key: item.key,
						lastModified: item.lastModified,
						chunks: item.chunks,
						region: item.region,
						bucket: item.bucket,
						version: item.version
					}
				}

				this._uuidToItem[item.uuid] = {
					uuid: item.uuid,
					type: "file",
					path: itemPath,
					metadata: {
						name: item.name,
						size: item.size,
						mime: item.mime,
						key: item.key,
						lastModified: item.lastModified,
						chunks: item.chunks,
						region: item.region,
						bucket: item.bucket,
						version: item.version
					}
				}
			}

			this.itemsMutex.release()
		}

		return names
	}

	/**
	 * Alias of readdir.
	 * @date 2/13/2024 - 8:48:40 PM
	 *
	 * @public
	 * @async
	 * @param {...Parameters<typeof this.readdir>} params
	 * @returns {Promise<string[]>}
	 */
	public async ls(...params: Parameters<typeof this.readdir>): Promise<string[]> {
		return await this.readdir(...params)
	}

	public async stat({ path }: { path: string }): Promise<FSStats> {
		path = this.normalizePath({
			path
		})

		const uuid = await this.pathToItemUUID({
			path
		})
		const item = this._items[path]

		if (!uuid || !item) {
			throw new ENOENT({
				path
			})
		}

		const now = Date.now()

		if (item.type === "file") {
			return {
				...item.metadata,
				uuid,
				size: item.metadata.size,
				mtimeMs: item.metadata.lastModified,
				birthtimeMs: item.metadata.creation ?? now,
				type: "file",
				isDirectory() {
					return false
				},
				isFile() {
					return true
				}
			}
		}

		return {
			name: item.metadata.name,
			uuid,
			size: 0,
			mtimeMs: item.metadata.timestamp ?? now,
			birthtimeMs: item.metadata.timestamp ?? now,
			type: "directory",
			isDirectory() {
				return true
			},
			isFile() {
				return false
			}
		}
	}

	/**
	 * Alias of stat.
	 * @date 2/13/2024 - 8:49:18 PM
	 *
	 * @public
	 * @async
	 * @param {...Parameters<typeof this.stat>} params
	 * @returns {Promise<FSStats>}
	 */
	public async lstat(...params: Parameters<typeof this.stat>): Promise<FSStats> {
		return await this.stat(...params)
	}

	/**
	 * Creates a directory at path. Recursively creates intermediate directories if they don't exist.
	 * @date 2/14/2024 - 1:34:11 AM
	 *
	 * @public
	 * @async
	 * @param {{ path: string }} param0
	 * @param {string} param0.path
	 * @returns {Promise<string>}
	 */
	public async mkdir({ path }: { path: string }): Promise<string> {
		await this.mkdirMutex.acquire()

		try {
			path = this.normalizePath({
				path
			})

			if (path === "/") {
				return this.sdk.config.baseFolderUUID!
			}

			const exists = await this.pathToItemUUID({
				path
			})

			if (exists) {
				return exists
			}

			const parentPath = pathModule.posix.dirname(path)
			const basename = pathModule.posix.basename(path)

			if (parentPath === "/" || parentPath === "." || parentPath === "") {
				const uuid = await this.sdk.cloud().createDirectory({
					name: basename,
					parent: this.sdk.config.baseFolderUUID!
				})

				await this.itemsMutex.acquire()

				this._items[path] = {
					uuid,
					type: "directory",
					metadata: {
						name: basename,
						timestamp: Date.now()
					}
				}

				this._uuidToItem[uuid] = {
					uuid,
					type: "directory",
					path,
					metadata: {
						name: basename,
						timestamp: Date.now()
					}
				}

				this.itemsMutex.release()

				return uuid
			}

			const pathEx = path.split("/")
			let builtPath = "/"

			for (const part of pathEx) {
				if (pathEx.length <= 0) {
					continue
				}

				builtPath = pathModule.posix.join(builtPath, part)

				if (!this._items[builtPath]) {
					const partBasename = pathModule.posix.basename(builtPath)
					const partParentPath = pathModule.posix.dirname(builtPath)
					const parentItem = this._items[partParentPath]

					if (!parentItem) {
						continue
					}

					const parentIsBase = partParentPath === "/" || partParentPath === "." || partParentPath === ""
					const parentUUID = parentIsBase ? this.sdk.config.baseFolderUUID! : parentItem.uuid

					const uuid = await this.sdk.cloud().createDirectory({
						name: partBasename,
						parent: parentUUID
					})

					await this.itemsMutex.acquire()

					this._items[builtPath] = {
						uuid,
						type: "directory",
						metadata: {
							name: partBasename,
							timestamp: Date.now()
						}
					}

					this._uuidToItem[uuid] = {
						uuid,
						type: "directory",
						path: builtPath,
						metadata: {
							name: partBasename,
							timestamp: Date.now()
						}
					}

					this.itemsMutex.release()
				}
			}

			const item = this._items[path]

			if (!item || !this._items[path]) {
				throw new ENOENT({
					path
				})
			}

			return item.uuid
		} finally {
			this.mkdirMutex.release()
		}
	}

	/**
	 * Rename or move a file/directory. Recursively creates intermediate directories if needed.
	 * @date 2/14/2024 - 1:39:32 AM
	 *
	 * @public
	 * @async
	 * @param {{ from: string; to: string }} param0
	 * @param {string} param0.from
	 * @param {string} param0.to
	 * @returns {Promise<void>}
	 */
	public async rename({ from, to }: { from: string; to: string }): Promise<void> {
		await this.mutex.acquire()

		try {
			from = this.normalizePath({
				path: from
			})
			to = this.normalizePath({
				path: to
			})

			if (from === "/" || from === to) {
				return
			}

			const uuid = await this.pathToItemUUID({
				path: from
			})
			const item = this._items[from]

			if (!uuid || !item || (item.type === "file" && item.metadata.key.length === 0)) {
				throw new ENOENT({ path: from })
			}

			const currentParentPath = pathModule.posix.dirname(from)
			const newParentPath = pathModule.posix.dirname(to)
			const newBasename = pathModule.posix.basename(to)
			const oldBasename = pathModule.posix.basename(from)

			const itemMetadata =
				item.type === "file"
					? ({
							name: newBasename,
							size: item.metadata.size,
							mime: item.metadata.mime,
							lastModified: item.metadata.lastModified,
							creation: item.metadata.creation,
							hash: item.metadata.hash,
							key: item.metadata.key,
							chunks: item.metadata.chunks,
							region: item.metadata.region,
							bucket: item.metadata.bucket,
							version: item.metadata.version
					  } satisfies FSItemFileMetadata)
					: ({
							name: newBasename
					  } satisfies FolderMetadata)

			if (newParentPath === currentParentPath) {
				if (to === "/" || newBasename.length <= 0) {
					return
				}

				if (item.type === "directory") {
					await this.sdk.cloud().renameDirectory({
						uuid,
						name: newBasename
					})
				} else {
					await this.sdk.cloud().renameFile({
						uuid,
						metadata: itemMetadata as FileMetadata,
						name: newBasename
					})
				}
			} else {
				if (to.startsWith(from + "/")) {
					return
				}

				if (oldBasename !== newBasename) {
					if (item.type === "directory") {
						await this.sdk.cloud().renameDirectory({
							uuid,
							name: newBasename
						})
					} else {
						await this.sdk.cloud().renameFile({
							uuid,
							metadata: itemMetadata as FileMetadata,
							name: newBasename
						})
					}
				}

				if (newParentPath === "/" || newParentPath === "." || newParentPath === "") {
					if (item.type === "directory") {
						await this.sdk.cloud().moveDirectory({
							uuid,
							to: this.sdk.config.baseFolderUUID!,
							metadata: itemMetadata as FolderMetadata
						})
					} else {
						await this.sdk.cloud().moveFile({
							uuid,
							to: this.sdk.config.baseFolderUUID!,
							metadata: itemMetadata as FileMetadata
						})
					}
				} else {
					await this.mkdir({
						path: newParentPath
					})

					const newParentItem = this._items[newParentPath]

					if (!newParentItem) {
						throw new ENOENT({
							path: newParentPath
						})
					}

					if (item.type === "directory") {
						await this.sdk.cloud().moveDirectory({
							uuid,
							to: newParentItem.uuid!,
							metadata: itemMetadata as FolderMetadata
						})
					} else {
						await this.sdk.cloud().moveFile({
							uuid,
							to: newParentItem.uuid,
							metadata: itemMetadata as FileMetadata
						})
					}
				}
			}

			await this.itemsMutex.acquire()

			this._items[to] = {
				...this._items[from],
				metadata: itemMetadata
			} as FSItem

			this._uuidToItem[item.uuid] = {
				...this._uuidToItem[item.uuid],
				path: to,
				metadata: itemMetadata
			} as FSItemUUID

			delete this._items[from]

			if (item.type === "directory") {
				for (const oldPath in this._items) {
					if (oldPath.startsWith(from + "/") && oldPath !== from) {
						const newPath = replacePathStartWithFromAndTo(oldPath, from, to)
						const oldItem = this._items[oldPath]

						if (oldItem) {
							this._items[newPath] = oldItem

							delete this._items[oldPath]

							const oldItemUUID = this._uuidToItem[oldItem.uuid]

							if (oldItemUUID) {
								this._uuidToItem[oldItem.uuid] = {
									...oldItemUUID,
									path: newPath
								} as FSItemUUID
							}
						}
					}
				}
			}

			this.itemsMutex.release()
		} finally {
			this.mutex.release()
		}
	}

	/**
	 * Returns filesystem information.
	 * @date 2/14/2024 - 2:13:19 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<StatFS>}
	 */
	public async statfs(): Promise<StatFS> {
		const account = await this.sdk.api(3).user().account()

		return {
			type: -1,
			bsize: BUFFER_SIZE,
			blocks: Infinity,
			bfree: Infinity,
			bavail: Infinity,
			files: -1,
			used: account.storage,
			max: account.maxStorage,
			ffree: Infinity
		}
	}

	/**
	 * Deletes file/directoy at path.
	 * @date 2/28/2024 - 4:57:19 PM
	 *
	 * @private
	 * @async
	 * @param {{ path: string; type?: FSItemType, permanent?: boolean }} param0
	 * @param {string} param0.path
	 * @param {FSItemType} param0.type
	 * @param {boolean} [param0.permanent=false]
	 * @returns {Promise<void>}
	 */
	private async _unlink({ path, type, permanent = false }: { path: string; type?: FSItemType; permanent?: boolean }): Promise<void> {
		await this.mutex.acquire()

		try {
			path = this.normalizePath({
				path
			})

			const uuid = await this.pathToItemUUID({
				path
			})
			const item = this._items[path]

			if (!uuid || !item) {
				return
			}

			const acceptedTypes: FSItemType[] = !type ? ["directory", "file"] : type === "directory" ? ["directory"] : ["file"]

			if (!acceptedTypes.includes(item.type)) {
				return
			}

			if (item.type === "directory") {
				if (permanent) {
					await this.sdk.cloud().deleteDirectory({
						uuid
					})
				} else {
					await this.sdk.cloud().trashDirectory({
						uuid
					})
				}
			} else {
				if (permanent) {
					await this.sdk.cloud().deleteFile({
						uuid
					})
				} else {
					await this.sdk.cloud().trashFile({
						uuid
					})
				}
			}

			await this.itemsMutex.acquire()

			delete this._uuidToItem[item.uuid]
			delete this._items[path]

			for (const entry in this._items) {
				if (entry.startsWith(path + "/") || entry === path) {
					const entryItem = this._items[entry]

					if (entryItem) {
						delete this._uuidToItem[entryItem.uuid]
					}

					delete this._items[entry]
				}
			}

			this.itemsMutex.release()
		} finally {
			this.mutex.release()
		}
	}

	/**
	 * Deletes file/directory at path.
	 * @date 2/28/2024 - 4:58:37 PM
	 *
	 * @public
	 * @async
	 * @param {{ path: string, permanent?: boolean }} param0
	 * @param {string} param0.path
	 * @param {boolean} [param0.permanent=false]
	 * @returns {Promise<void>}
	 */
	public async unlink({ path, permanent = false }: { path: string; permanent?: boolean }): Promise<void> {
		return await this._unlink({
			path,
			permanent
		})
	}

	/**
	 * Alias of unlink.
	 * @date 2/28/2024 - 4:58:30 PM
	 *
	 * @public
	 * @async
	 * @param {{ path: string, permanent?: boolean }} param0
	 * @param {string} param0.path
	 * @param {boolean} [param0.permanent=false]
	 * @returns {Promise<void>}
	 */
	public async rm({ path, permanent = false }: { path: string; permanent?: boolean }): Promise<void> {
		return await this._unlink({
			path,
			permanent
		})
	}

	/**
	 * Deletes directory at path.
	 * @date 2/14/2024 - 2:53:48 AM
	 *
	 * @public
	 * @async
	 * @param {...Parameters<typeof this.unlink>} params
	 * @returns {Promise<void>}
	 */
	public async rmdir(...params: Parameters<typeof this.unlink>): Promise<void> {
		return await this._unlink({
			path: params[0].path,
			type: "directory",
			permanent: params[0].permanent
		})
	}

	/**
	 * Deletes a file at path.
	 *
	 * @public
	 * @async
	 * @param {...Parameters<typeof this.unlink>} params
	 * @returns {Promise<void>}
	 */
	public async rmfile(...params: Parameters<typeof this.unlink>): Promise<void> {
		return await this._unlink({
			path: params[0].path,
			type: "file",
			permanent: params[0].permanent
		})
	}

	/**
	 * Read a file. Returns buffer of given length, at position and offset. Memory efficient to read only a small part of a file.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		path: string
	 * 		offset?: number
	 * 		length?: number
	 * 		position?: number
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 		onProgressId?: string
	 * 	}} param0
	 * @param {string} param0.path
	 * @param {number} param0.offset
	 * @param {number} param0.length
	 * @param {number} param0.position
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @param {string} param0.onProgressId
	 * @returns {Promise<Buffer>}
	 */
	public async read({
		path,
		offset,
		length,
		position,
		abortSignal,
		pauseSignal,
		onProgress,
		onProgressId
	}: {
		path: string
		offset?: number
		length?: number
		position?: number
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onProgressId?: string
	}): Promise<Buffer> {
		path = this.normalizePath({
			path
		})

		const uuid = await this.pathToItemUUID({
			path
		})
		const item = this._items[path]

		if (!uuid || !item || item.type === "directory" || (item.type === "file" && item.metadata.key.length === 0)) {
			throw new ENOENT({
				path
			})
		}

		if (item.metadata.size <= 0) {
			return Buffer.from([])
		}

		if (!position) {
			position = 0
		}

		if (!length) {
			length = item.metadata.size - 1
		}

		const stream = this.sdk.cloud().downloadFileToReadableStream({
			uuid,
			bucket: item.metadata.bucket,
			region: item.metadata.region,
			size: item.metadata.size,
			chunks: item.metadata.chunks,
			version: item.metadata.version,
			key: item.metadata.key,
			abortSignal,
			pauseSignal,
			onProgress,
			onProgressId,
			start: position,
			end: position + length
		})

		let buffer = Buffer.from([])
		const reader = stream.getReader()
		let doneReading = false

		while (!doneReading) {
			const { done, value } = await reader.read()

			if (done) {
				doneReading = true

				break
			}

			if (value instanceof Uint8Array && value.byteLength > 0) {
				buffer = Buffer.concat([buffer, value])
			}
		}

		if (offset) {
			return buffer.subarray(offset, offset + Math.min(buffer.byteLength, length))
		}

		return buffer
	}

	/**
	 * Alias of writeFile.
	 * @date 2/20/2024 - 9:45:40 PM
	 *
	 * @public
	 * @async
	 * @param {...Parameters<typeof this.writeFile>} params
	 * @returns {Promise<CloudItem>}
	 */
	public async write(...params: Parameters<typeof this.writeFile>): Promise<CloudItem> {
		return await this.writeFile(...params)
	}

	/**
	 * Read a file at path. Warning: This reads the whole file into memory and can be pretty inefficient.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		path: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 		onProgressId?: string
	 * 	}} param0
	 * @param {string} param0.path
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @param {string} param0.onProgressId
	 * @returns {Promise<Buffer>}
	 */
	public async readFile({
		path,
		abortSignal,
		pauseSignal,
		onProgress,
		onProgressId
	}: {
		path: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onProgressId?: string
	}): Promise<Buffer> {
		return await this.read({
			path,
			abortSignal,
			pauseSignal,
			onProgress,
			onProgressId
		})
	}

	/**
	 * Write to a file. Warning: This reads the whole file into memory and can be very inefficient. Only available in a Node.JS environment.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		path: string
	 * 		content: Buffer
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback,
	 * 		onProgressId?: string
	 * 	}} param0
	 * @param {string} param0.path
	 * @param {Buffer} param0.content
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @param {string} param0.onProgressId
	 * @returns {Promise<CloudItem>}
	 */
	public async writeFile({
		path,
		content,
		abortSignal,
		pauseSignal,
		onProgress,
		onProgressId
	}: {
		path: string
		content: Buffer
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onProgressId?: string
	}): Promise<CloudItem> {
		if (environment !== "node") {
			throw new Error(`fs.writeFile is not implemented for a ${environment} environment`)
		}

		path = this.normalizePath({
			path
		})

		const parentPath = pathModule.posix.dirname(path)
		let parentUUID = ""
		const fileName = pathModule.posix.basename(path)

		if (fileName.length === 0 || fileName === "." || fileName === "/") {
			throw new Error("Could not parse file name.")
		}

		if (parentPath === "/" || parentPath === "." || parentPath === "") {
			parentUUID = this.sdk.config.baseFolderUUID!
		} else {
			await this.mkdir({ path: parentPath })

			const parentItemUUID = await this.pathToItemUUID({
				path: parentPath,
				type: "directory"
			})
			const parentItem = this._items[parentPath]

			if (!parentItemUUID || !parentItem) {
				throw new Error(`Could not find parent for path ${path}`)
			}

			parentUUID = parentItem.uuid
		}

		const tmpDir = this.sdk.config.tmpPath ? this.sdk.config.tmpPath : os.tmpdir()
		const tmpFilePath = pathModule.join(tmpDir, "filen-sdk", await uuidv4())

		await fs.rm(tmpFilePath, {
			force: true,
			maxRetries: 60 * 10,
			recursive: true,
			retryDelay: 100
		})

		await fs.mkdir(pathModule.join(tmpFilePath, ".."), {
			recursive: true
		})

		await writeFileAtomic(tmpFilePath, content)

		try {
			const item = await this.sdk.cloud().uploadLocalFile({
				source: tmpFilePath,
				parent: parentUUID,
				name: fileName,
				abortSignal,
				pauseSignal,
				onProgress,
				onProgressId
			})

			if (item.type === "file") {
				await this.itemsMutex.acquire()

				this._items[path] = {
					uuid: item.uuid,
					type: "file",
					metadata: {
						name: item.name,
						size: item.size,
						mime: item.mime,
						key: item.key,
						lastModified: item.lastModified,
						chunks: item.chunks,
						region: item.region,
						bucket: item.bucket,
						version: item.version
					}
				}

				this.itemsMutex.release()
			}

			return item
		} finally {
			await fs.rm(tmpFilePath, {
				force: true,
				maxRetries: 60 * 10,
				recursive: true,
				retryDelay: 100
			})
		}
	}

	/**
	 * Download a file or directory from path to a local destination path. Only available in a Node.JS environment.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		path: string
	 * 		destination: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 		onProgressId?: string
	 * 	}} param0
	 * @param {string} param0.path
	 * @param {string} param0.destination
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @param {string} param0.onProgressId
	 * @returns {Promise<void>}
	 */
	public async download({
		path,
		destination,
		abortSignal,
		pauseSignal,
		onProgress,
		onProgressId
	}: {
		path: string
		destination: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onProgressId?: string
	}): Promise<void> {
		if (environment !== "node") {
			throw new Error(`fs.download is not implemented for a ${environment} environment`)
		}

		path = this.normalizePath({
			path
		})
		destination = normalizePath(destination)

		const uuid = await this.pathToItemUUID({
			path
		})
		const item = this._items[path]

		if (!uuid || !item || (item.type === "file" && item.metadata.key.length === 0)) {
			throw new ENOENT({ path })
		}

		if (item.type === "directory") {
			await this.sdk.cloud().downloadDirectoryToLocal({
				uuid,
				to: destination,
				abortSignal,
				pauseSignal,
				onProgress,
				onProgressId
			})

			return
		}

		await this.sdk.cloud().downloadFileToLocal({
			uuid,
			bucket: item.metadata.bucket,
			region: item.metadata.region,
			chunks: item.metadata.chunks,
			version: item.metadata.version,
			key: item.metadata.key,
			to: destination,
			abortSignal,
			pauseSignal,
			onProgress,
			onProgressId,
			size: item.metadata.size
		})
	}

	/**
	 * Upload file or directory to path from a local source path. Recursively creates intermediate directories if needed. Only available in a Node.JS environment.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		path: string
	 * 		source: string
	 * 		overwriteDirectory?: boolean
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 		onProgressId?: string
	 * 	}} param0
	 * @param {string} param0.path
	 * @param {string} param0.source
	 * @param {boolean} [param0.overwriteDirectory=false]
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @param {string} param0.onProgressId
	 * @returns {Promise<CloudItem>}
	 */
	public async upload({
		path,
		source,
		overwriteDirectory = false,
		abortSignal,
		pauseSignal,
		onProgress,
		onProgressId
	}: {
		path: string
		source: string
		overwriteDirectory?: boolean
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onProgressId?: string
	}): Promise<CloudItem> {
		if (environment !== "node") {
			throw new Error(`fs.upload is not implemented for a ${environment} environment`)
		}

		path = this.normalizePath({ path })
		source = normalizePath(source)

		const sourceStat = await fs.stat(source)
		const parentPath = pathModule.posix.dirname(path)
		let parentUUID = ""
		const name = pathModule.posix.basename(path)

		if (name.length === 0 || name === "." || name === "/") {
			throw new Error("Could not parse name.")
		}

		if (parentPath === "/" || parentPath === "." || parentPath === "") {
			parentUUID = this.sdk.config.baseFolderUUID!
		} else {
			await this.mkdir({
				path: parentPath
			})

			const parentItemUUID = await this.pathToItemUUID({
				path: parentPath,
				type: "directory"
			})
			const parentItem = this._items[parentPath]

			if (!parentItemUUID || !parentItem) {
				throw new Error(`Could not find parent for path ${path}.`)
			}

			parentUUID = parentItem.uuid
		}

		if (sourceStat.isDirectory()) {
			if (overwriteDirectory) {
				await this._unlink({
					path,
					permanent: true,
					type: "directory"
				})
			}

			await this.sdk.cloud().uploadLocalDirectory({
				source,
				parent: parentUUID,
				name,
				abortSignal,
				pauseSignal,
				onProgress,
				onProgressId
			})

			const dir = await this.readdir({
				path: parentPath
			})

			const foundUploadedDir = dir.filter(entry => entry === name && !entry.includes("/"))

			if (!foundUploadedDir[0]) {
				throw new Error("Could not find uploaded directory.")
			}

			const foundUploadedDirStat = await this.stat({
				path: pathModule.posix.join(parentPath, foundUploadedDir[0])
			})

			return {
				type: "directory",
				uuid: foundUploadedDirStat.uuid,
				name,
				size: foundUploadedDirStat.size,
				lastModified: foundUploadedDirStat.mtimeMs,
				timestamp: Date.now(),
				parent: parentUUID,
				favorited: false,
				color: null
			} satisfies CloudItem
		} else {
			const item = await this.sdk.cloud().uploadLocalFile({
				source,
				parent: parentUUID,
				name,
				abortSignal,
				pauseSignal,
				onProgress,
				onProgressId
			})

			if (item.type === "file") {
				await this.itemsMutex.acquire()

				this._items[path] = {
					uuid: item.uuid,
					type: "file",
					metadata: {
						name: item.name,
						size: item.size,
						mime: item.mime,
						key: item.key,
						lastModified: item.lastModified,
						chunks: item.chunks,
						region: item.region,
						bucket: item.bucket,
						version: item.version
					}
				}

				this._uuidToItem[item.uuid] = {
					uuid: item.uuid,
					type: "file",
					path,
					metadata: {
						name: item.name,
						size: item.size,
						mime: item.mime,
						key: item.key,
						lastModified: item.lastModified,
						chunks: item.chunks,
						region: item.region,
						bucket: item.bucket,
						version: item.version
					}
				}

				this.itemsMutex.release()
			}

			return item
		}
	}

	/**
	 * Copy a file or directory structure. Recursively creates intermediate directories if needed.
	 * Warning: Can be really inefficient when copying large directory structures.
	 * All files need to be downloaded first and then reuploaded due to our end to end encryption.
	 * Plain copying unfortunately does not work. Only available in a Node.JS environment.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		from: string
	 * 		to: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 		onProgressId?: string
	 * 	}} param0
	 * @param {string} param0.from
	 * @param {string} param0.to
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @param {string} param0.onProgressId
	 * @returns {Promise<void>}
	 */
	public async cp({
		from,
		to,
		abortSignal,
		pauseSignal,
		onProgress,
		onProgressId
	}: {
		from: string
		to: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onProgressId?: string
	}): Promise<void> {
		if (environment !== "node") {
			throw new Error(`fs.cp is not implemented for a ${environment} environment`)
		}

		from = this.normalizePath({
			path: from
		})
		to = this.normalizePath({
			path: to
		})

		if (from === "/" || from === to || to.startsWith(from + "/")) {
			return
		}

		const uuid = await this.pathToItemUUID({
			path: from
		})
		const item = this._items[from]

		if (!uuid || !item || (item.type === "file" && item.metadata.key.length === 0)) {
			throw new ENOENT({ path: from })
		}

		const parentPath = pathModule.posix.dirname(to)
		let parentUUID = ""

		if (parentPath === "/" || parentPath === "." || parentPath === "") {
			parentUUID = this.sdk.config.baseFolderUUID!
		} else {
			await this.mkdir({
				path: parentPath
			})

			const parentItemUUID = await this.pathToItemUUID({
				path: parentPath,
				type: "directory"
			})
			const parentItem = this._items[parentPath]

			if (!parentItemUUID || !parentItem) {
				throw new Error(`Could not find parent for path ${to}`)
			}

			parentUUID = parentItem.uuid
		}

		if (item.type === "directory") {
			const tmpDir = this.sdk.config.tmpPath ? this.sdk.config.tmpPath : os.tmpdir()
			const baseDirectoryName = pathModule.posix.basename(from)

			if (!baseDirectoryName || baseDirectoryName.length === 0 || baseDirectoryName === ".") {
				throw new Error("Could not parse baseDirectoryName.")
			}

			const newDirectoryName = pathModule.posix.basename(to)

			if (!newDirectoryName || newDirectoryName.length === 0 || newDirectoryName === ".") {
				throw new Error("Could not parse newDirectoryName.")
			}

			const tmpDirectoryPath = normalizePath(pathModule.join(tmpDir, "filen-sdk", await uuidv4(), newDirectoryName))

			await this.sdk.cloud().downloadDirectoryToLocal({
				uuid,
				to: tmpDirectoryPath
			})

			try {
				await this.sdk.cloud().uploadLocalDirectory({
					source: tmpDirectoryPath,
					parent: parentUUID,
					abortSignal,
					pauseSignal,
					onProgress,
					onProgressId,
					name: newDirectoryName
				})

				await this.readdir({
					path: to,
					recursive: true
				})
			} finally {
				await fs.rm(pathModule.join(tmpDirectoryPath, ".."), {
					force: true,
					maxRetries: 60 * 10,
					recursive: true,
					retryDelay: 100
				})
			}
		} else {
			const newFileName = pathModule.posix.basename(to)

			if (!newFileName || newFileName.length === 0 || newFileName === ".") {
				throw new Error("Could not parse newFileName.")
			}

			const tmpFilePath = await this.sdk.cloud().downloadFileToLocal({
				uuid,
				bucket: item.metadata.bucket,
				region: item.metadata.region,
				chunks: item.metadata.chunks,
				version: item.metadata.version,
				key: item.metadata.key,
				abortSignal,
				pauseSignal,
				onProgress,
				onProgressId,
				size: item.metadata.size
			})

			try {
				const uploadedItem = await this.sdk.cloud().uploadLocalFile({
					source: tmpFilePath,
					parent: parentUUID,
					abortSignal,
					pauseSignal,
					onProgress,
					onProgressId,
					name: newFileName
				})

				if (uploadedItem.type === "file") {
					await this.itemsMutex.acquire()

					this._items[to] = {
						uuid: item.uuid,
						type: "file",
						metadata: {
							name: uploadedItem.name,
							size: uploadedItem.size,
							mime: uploadedItem.mime,
							key: uploadedItem.key,
							lastModified: uploadedItem.lastModified,
							chunks: uploadedItem.chunks,
							region: uploadedItem.region,
							bucket: uploadedItem.bucket,
							version: uploadedItem.version
						}
					}

					this._uuidToItem[item.uuid] = {
						uuid: item.uuid,
						type: "file",
						path: to,
						metadata: {
							name: uploadedItem.name,
							size: uploadedItem.size,
							mime: uploadedItem.mime,
							key: uploadedItem.key,
							lastModified: uploadedItem.lastModified,
							chunks: uploadedItem.chunks,
							region: uploadedItem.region,
							bucket: uploadedItem.bucket,
							version: uploadedItem.version
						}
					}

					this.itemsMutex.release()
				}
			} finally {
				await fs.rm(tmpFilePath, {
					force: true,
					maxRetries: 60 * 10,
					recursive: true,
					retryDelay: 100
				})
			}
		}
	}

	/**
	 * Alias of cp.
	 * @date 2/14/2024 - 5:07:27 AM
	 *
	 * @public
	 * @async
	 * @param {...Parameters<typeof this.cp>} params
	 * @returns {Promise<void>}
	 */
	public async copy(...params: Parameters<typeof this.cp>): Promise<void> {
		return await this.cp(...params)
	}
}

export default FS
