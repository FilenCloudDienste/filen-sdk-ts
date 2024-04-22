import type API from "../api"
import type { FilenSDKConfig } from ".."
import type { FolderMetadata, FileMetadata, FileEncryptionVersion, ProgressCallback } from "../types"
import pathModule from "path"
import { ENOENT } from "./errors"
import { BUFFER_SIZE, environment } from "../constants"
import type { PauseSignal } from "../cloud/signals"
import fs from "fs-extra"
import { uuidv4, normalizePath } from "../utils"
import os from "os"
import type { CloudItem, Cloud } from "../cloud"
import {
	Socket,
	SocketFileArchiveRestored,
	SocketFileRename,
	SocketFileMove,
	SocketFileTrash,
	SocketFileArchived,
	SocketFolderMove,
	SocketFolderRename,
	SocketFolderTrash
} from "../socket"
import { Semaphore } from "../semaphore"

export type FSConfig = {
	sdkConfig: FilenSDKConfig
	api: API
	cloud: Cloud
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

export type FSItem =
	| (FSItemBase & {
			type: "directory"
			metadata: FolderMetadata
	  })
	| (FSItemBase & {
			type: "file"
			metadata: FSItemFileBase & FileMetadata
	  })

export type FSItems = Record<string, FSItem>

export type FSStatsBase = {
	size: number
	mtimeMs: number
	birthtimeMs: number
	isDirectory: () => boolean
	isFile: () => boolean
	isSymbolicLink: () => boolean
}

export type FSStats =
	| (FolderMetadata & FSStatsBase & { type: "directory"; uuid: string })
	| (FSItemFileBase & FileMetadata & FSStatsBase & { type: "file"; uuid: string })

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
	private readonly api: API
	private readonly sdkConfig: FilenSDKConfig
	private readonly cloud: Cloud
	private _items: FSItems
	private _uuidToItem: Record<string, FSItemUUID>
	private readonly socket = new Socket()
	private readonly mutex = new Semaphore(1)
	private readonly mkdirMutex = new Semaphore(1)

	/**
	 * Creates an instance of FS.
	 * @date 2/9/2024 - 5:54:11 AM
	 *
	 * @constructor
	 * @public
	 * @param {FSConfig} params
	 */
	public constructor(params: FSConfig) {
		this.api = params.api
		this.sdkConfig = params.sdkConfig
		this.cloud = params.cloud

		this._items = {
			"/": {
				uuid: this.sdkConfig.baseFolderUUID!,
				type: "directory",
				metadata: {
					name: "Cloud Drive"
				}
			}
		}

		this._uuidToItem = {
			[this.sdkConfig.baseFolderUUID!]: {
				uuid: this.sdkConfig.baseFolderUUID!,
				type: "directory",
				path: "/",
				metadata: {
					name: "Cloud Drive"
				}
			}
		}

		if (params.sdkConfig.apiKey && params.connectToSocket) {
			this.socket.connect({ apiKey: params.sdkConfig.apiKey })
		}

		this._initSocketEvents()
	}

	/**
	 * Attach listeners for relevant realtime events.
	 * @date 3/1/2024 - 7:23:35 PM
	 *
	 * @private
	 */
	private _initSocketEvents(): void {
		this.socket.on("fileArchiveRestored", (data: SocketFileArchiveRestored) => {
			if (this._uuidToItem[data.currentUUID]) {
				delete this._items[this._uuidToItem[data.currentUUID].path]
				delete this._uuidToItem[data.currentUUID]
			}

			if (this._uuidToItem[data.uuid]) {
				delete this._items[this._uuidToItem[data.uuid].path]
				delete this._uuidToItem[data.uuid]
			}
		})

		this.socket.on("fileRename", (data: SocketFileRename) => {
			if (this._uuidToItem[data.uuid]) {
				delete this._items[this._uuidToItem[data.uuid].path]
				delete this._uuidToItem[data.uuid]
			}
		})

		this.socket.on("fileMove", (data: SocketFileMove) => {
			if (this._uuidToItem[data.uuid]) {
				delete this._items[this._uuidToItem[data.uuid].path]
				delete this._uuidToItem[data.uuid]
			}
		})

		this.socket.on("fileTrash", (data: SocketFileTrash) => {
			if (this._uuidToItem[data.uuid]) {
				delete this._items[this._uuidToItem[data.uuid].path]
				delete this._uuidToItem[data.uuid]
			}
		})

		this.socket.on("fileArchived", (data: SocketFileArchived) => {
			if (this._uuidToItem[data.uuid]) {
				delete this._items[this._uuidToItem[data.uuid].path]
				delete this._uuidToItem[data.uuid]
			}
		})

		this.socket.on("folderTrash", (data: SocketFolderTrash) => {
			if (this._uuidToItem[data.uuid]) {
				for (const path in this._items) {
					if (path.startsWith(this._uuidToItem[data.uuid].path + "/") || this._uuidToItem[data.uuid].path === path) {
						delete this._items[path]
					}
				}

				delete this._items[this._uuidToItem[data.uuid].path]
				delete this._uuidToItem[data.uuid]
			}
		})

		this.socket.on("folderMove", (data: SocketFolderMove) => {
			if (this._uuidToItem[data.uuid]) {
				for (const path in this._items) {
					if (path.startsWith(this._uuidToItem[data.uuid].path + "/") || this._uuidToItem[data.uuid].path === path) {
						delete this._items[path]
					}
				}

				delete this._items[this._uuidToItem[data.uuid].path]
				delete this._uuidToItem[data.uuid]
			}
		})

		this.socket.on("folderRename", (data: SocketFolderRename) => {
			if (this._uuidToItem[data.uuid]) {
				for (const path in this._items) {
					if (path.startsWith(this._uuidToItem[data.uuid].path + "/") || this._uuidToItem[data.uuid].path === path) {
						delete this._items[path]
					}
				}

				delete this._items[this._uuidToItem[data.uuid].path]
				delete this._uuidToItem[data.uuid]
			}
		})
	}

	/**
	 * Add an item to the internal item tree.
	 * @date 2/14/2024 - 12:50:52 AM
	 *
	 * @public
	 * @param {{ path: string, item: FSItem }} param0
	 * @param {string} param0.path
	 * @param {FSItem} param0.item
	 * @returns {void}
	 */
	public _addItem({ path, item }: { path: string; item: FSItem }): void {
		this._items[path] = item
		this._uuidToItem[item.uuid] = {
			...item,
			path
		}
	}

	/**
	 * Remove an item from the internal item tree.
	 * @date 2/14/2024 - 12:50:52 AM
	 *
	 * @public
	 * @param {{ path: string }} param0
	 * @param {string} param0.path
	 * @returns {void}
	 */
	public _removeItem({ path }: { path: string }): void {
		for (const entry in this._items) {
			if (entry.startsWith(path + "/") || entry === path) {
				delete this._uuidToItem[this._items[entry].uuid]
				delete this._items[entry]
			}
		}
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
		path = pathModule.posix.normalize(path.trim())

		if (path.endsWith("/")) {
			path = path.substring(0, path.length - 1)
		}

		if (!path.startsWith("/")) {
			path = "/" + path
		}

		return path
	}

	private async pathToItemUUID({ path, type }: { path: string; type?: FSItemType }): Promise<string | null> {
		path = this.normalizePath({ path })

		const acceptedTypes: FSItemType[] = !type ? ["directory", "file"] : type === "directory" ? ["directory"] : ["file"]

		if (path === "/") {
			return this.sdkConfig.baseFolderUUID!
		}

		if (this._items[path] && acceptedTypes.includes(this._items[path].type)) {
			return this._items[path].uuid
		}

		const pathEx = path.split("/")
		let builtPath = "/"

		for (const part of pathEx) {
			if (pathEx.length <= 0) {
				continue
			}

			builtPath = pathModule.posix.join(builtPath, part)

			const parentDirname = pathModule.posix.dirname(builtPath)

			if (!this._items[parentDirname]) {
				return null
			}

			const content = await this.cloud.listDirectory({ uuid: this._items[parentDirname].uuid })
			let foundUUID = ""
			let foundType: FSItemType | null = null

			for (const item of content) {
				const itemPath = pathModule.posix.join(parentDirname, item.name)

				if (itemPath === path) {
					foundUUID = item.uuid
					foundType = item.type
				}

				if (item.type === "directory") {
					this._items[itemPath] = {
						uuid: item.uuid,
						type: "directory",
						metadata: {
							name: item.name
						}
					}

					this._uuidToItem[item.uuid] = {
						uuid: item.uuid,
						type: "directory",
						path: itemPath,
						metadata: {
							name: item.name
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
			}

			if (foundType && foundUUID.length > 0 && acceptedTypes.includes(foundType)) {
				return foundUUID
			}
		}

		if (this._items[path] && acceptedTypes.includes(this._items[path].type)) {
			return this._items[path].uuid
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

		const uuid = await this.pathToItemUUID({ path })

		if (!uuid) {
			throw new ENOENT({ path })
		}

		const names: string[] = []
		const existingPaths: Record<string, boolean> = {}

		try {
			if (recursive) {
				const tree = await this.cloud.getDirectoryTree({ uuid })

				for (const entry in tree) {
					const item = tree[entry]
					const entryPath = entry.startsWith("/") ? entry.substring(1) : entry

					if (item.parent === "base" && existingPaths[entry]) {
						continue
					}

					existingPaths[entry] = true

					const itemPath = pathModule.posix.join(path, entryPath)

					names.push(entryPath)

					if (item.type === "directory") {
						this._items[itemPath] = {
							uuid: item.uuid,
							type: "directory",
							metadata: {
								name: item.name
							}
						}

						this._uuidToItem[item.uuid] = {
							uuid: item.uuid,
							type: "directory",
							path: itemPath,
							metadata: {
								name: item.name
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
				}

				return names
			}

			const items = (await this.cloud.listDirectory({ uuid })).sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }))

			for (const item of items) {
				const itemPath = pathModule.posix.join(path, item.name)

				if (existingPaths[item.name]) {
					continue
				}

				existingPaths[item.name] = true

				names.push(item.name)

				if (item.type === "directory") {
					this._items[itemPath] = {
						uuid: item.uuid,
						type: "directory",
						metadata: {
							name: item.name
						}
					}

					this._uuidToItem[item.uuid] = {
						uuid: item.uuid,
						type: "directory",
						path: itemPath,
						metadata: {
							name: item.name
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
			}
		} catch (e) {
			console.error(e)
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
		path = this.normalizePath({ path })

		const uuid = await this.pathToItemUUID({ path })
		const item = this._items[path]

		if (!uuid || !item) {
			throw new ENOENT({ path })
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
				},
				isSymbolicLink() {
					return false
				}
			}
		}

		return {
			...item.metadata,
			uuid,
			size: 0,
			mtimeMs: now,
			birthtimeMs: now,
			type: "directory",
			isDirectory() {
				return true
			},
			isFile() {
				return false
			},
			isSymbolicLink() {
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
			path = this.normalizePath({ path })

			if (path === "/") {
				return this.sdkConfig.baseFolderUUID!
			}

			const exists = await this.pathToItemUUID({ path })

			if (exists) {
				return exists
			}

			const parentPath = pathModule.posix.dirname(path)
			const basename = pathModule.posix.basename(path)

			if (parentPath === "/" || parentPath === "." || parentPath === "") {
				const uuid = await this.cloud.createDirectory({ name: basename, parent: this.sdkConfig.baseFolderUUID! })

				this._items[path] = {
					uuid,
					type: "directory",
					metadata: {
						name: basename
					}
				}

				this._uuidToItem[uuid] = {
					uuid,
					type: "directory",
					path,
					metadata: {
						name: basename
					}
				}

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
					const parentUUID = parentIsBase ? this.sdkConfig.baseFolderUUID! : parentItem.uuid
					const uuid = await this.cloud.createDirectory({ name: partBasename, parent: parentUUID })

					this._items[builtPath] = {
						uuid,
						type: "directory",
						metadata: {
							name: partBasename
						}
					}

					this._uuidToItem[uuid] = {
						uuid,
						type: "directory",
						path: builtPath,
						metadata: {
							name: partBasename
						}
					}
				}
			}

			if (!this._items[path]) {
				throw new ENOENT({ path })
			}

			return this._items[path].uuid
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
			from = this.normalizePath({ path: from })
			to = this.normalizePath({ path: to })

			if (from === "/" || from === to) {
				return
			}

			const uuid = await this.pathToItemUUID({ path: from })
			const item = this._items[from]

			if (!uuid || !item) {
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
							key: item.metadata.key
					  } satisfies FileMetadata)
					: ({
							name: newBasename
					  } satisfies FolderMetadata)

			if (newParentPath === currentParentPath) {
				if (to === "/" || newBasename.length <= 0) {
					return
				}

				if (item.type === "directory") {
					await this.cloud.renameDirectory({ uuid, name: newBasename })
				} else {
					await this.cloud.renameFile({
						uuid,
						metadata: itemMetadata as FileMetadata,
						name: newBasename
					})
				}

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
			} else {
				if (oldBasename !== newBasename) {
					if (item.type === "directory") {
						await this.cloud.renameDirectory({ uuid, name: newBasename })
					} else {
						await this.cloud.renameFile({
							uuid,
							metadata: itemMetadata as FileMetadata,
							name: newBasename
						})
					}
				}

				if (newParentPath === "/" || newParentPath === "." || newParentPath === "") {
					if (item.type === "directory") {
						await this.cloud.moveDirectory({
							uuid,
							to: this.sdkConfig.baseFolderUUID!,
							metadata: itemMetadata as FolderMetadata
						})
					} else {
						await this.cloud.moveFile({ uuid, to: this.sdkConfig.baseFolderUUID!, metadata: itemMetadata as FileMetadata })
					}
				} else {
					await this.mkdir({ path: newParentPath })

					const newParentItem = this._items[newParentPath]

					if (!newParentItem) {
						throw new ENOENT({ path: newParentPath })
					}

					if (item.type === "directory") {
						await this.cloud.moveDirectory({ uuid, to: newParentItem.uuid!, metadata: itemMetadata as FolderMetadata })
					} else {
						await this.cloud.moveFile({ uuid, to: newParentItem.uuid, metadata: itemMetadata as FileMetadata })
					}
				}

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

				for (const oldPath in this._items) {
					if (oldPath.startsWith(from + "/") || oldPath === from) {
						const newPath = oldPath.split(from).join(to)

						this._items[newPath] = {
							...this._items[oldPath],
							metadata: {
								...this._items[oldPath].metadata,
								name: newBasename
							}
						} as FSItem

						this._uuidToItem[this._items[oldPath].uuid] = {
							...this._uuidToItem[this._items[oldPath].uuid],
							path: newPath,
							metadata: {
								...this._uuidToItem[this._items[oldPath].uuid].metadata,
								name: newBasename
							}
						} as FSItemUUID

						delete this._items[oldPath]
					}
				}
			}
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
		const account = await this.api.v3().user().account()

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
			path = this.normalizePath({ path })

			const uuid = await this.pathToItemUUID({ path })

			if (!uuid || !this._items[path]) {
				return
			}

			const acceptedTypes: FSItemType[] = !type ? ["directory", "file"] : type === "directory" ? ["directory"] : ["file"]

			if (!acceptedTypes.includes(this._items[path].type)) {
				return
			}

			if (this._items[path].type === "directory") {
				if (permanent) {
					await this.cloud.deleteDirectory({ uuid })
				} else {
					await this.cloud.trashDirectory({ uuid })
				}
			} else {
				if (permanent) {
					await this.cloud.deleteFile({ uuid })
				} else {
					await this.cloud.trashFile({ uuid })
				}
			}

			delete this._uuidToItem[this._items[path].uuid]
			delete this._items[path]

			for (const entry in this._items) {
				if (entry.startsWith(path + "/") || entry === path) {
					delete this._uuidToItem[this._items[entry].uuid]
					delete this._items[entry]
				}
			}
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
		return await this._unlink({ path, permanent })
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
		return await this._unlink({ path, permanent })
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
		return await this._unlink({ path: params[0].path, type: "directory", permanent: params[0].permanent })
	}

	/**
	 * Read a file. Returns buffer of given length, at position and offset. Memory efficient to read only a small part of a file.
	 * @date 3/18/2024 - 12:07:38 AM
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
	 * 	}} param0
	 * @param {string} param0.path
	 * @param {number} param0.offset
	 * @param {number} param0.length
	 * @param {number} param0.position
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @returns {Promise<Buffer>}
	 */
	public async read({
		path,
		offset,
		length,
		position,
		abortSignal,
		pauseSignal,
		onProgress
	}: {
		path: string
		offset?: number
		length?: number
		position?: number
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
	}): Promise<Buffer> {
		path = this.normalizePath({ path })

		const uuid = await this.pathToItemUUID({ path })
		const item = this._items[path]

		if (!uuid || !item || item.type === "directory") {
			throw new ENOENT({ path })
		}

		if (!position) {
			position = 0
		}

		if (!length) {
			length = item.metadata.size
		}

		const stream = await this.cloud.downloadFileToReadableStream({
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
	 * @date 2/16/2024 - 5:32:31 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		path: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 	}} param0
	 * @param {string} param0.path
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @returns {Promise<Buffer>}
	 */
	public async readFile({
		path,
		abortSignal,
		pauseSignal,
		onProgress
	}: {
		path: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
	}): Promise<Buffer> {
		return await this.read({ path, abortSignal, pauseSignal, onProgress })
	}

	/**
	 * Write to a file. Warning: This reads the whole file into memory and can be very inefficient. Only available in a Node.JS environment.
	 * @date 2/16/2024 - 5:36:19 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		path: string
	 * 		content: Buffer
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 	}} param0
	 * @param {string} param0.path
	 * @param {Buffer} param0.content
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @returns {Promise<void>}
	 */
	public async writeFile({
		path,
		content,
		abortSignal,
		pauseSignal,
		onProgress
	}: {
		path: string
		content: Buffer
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
	}): Promise<CloudItem> {
		if (environment !== "node") {
			throw new Error(`fs.writeFile is not implemented for a ${environment} environment`)
		}

		path = this.normalizePath({ path })

		const parentPath = pathModule.posix.dirname(path)
		let parentUUID = ""
		const fileName = pathModule.posix.basename(path)

		if (fileName.length === 0 || fileName === "." || fileName === "/") {
			throw new Error("Could not parse file name.")
		}

		if (parentPath === "/" || parentPath === "." || parentPath === "") {
			parentUUID = this.sdkConfig.baseFolderUUID!
		} else {
			await this.mkdir({ path: parentPath })

			const parentItemUUID = await this.pathToItemUUID({ path: parentPath, type: "directory" })
			const parentItem = this._items[parentPath]

			if (!parentItemUUID || !parentItem) {
				throw new Error(`Could not find parent for path ${path}`)
			}

			parentUUID = parentItem.uuid
		}

		const tmpDir = this.sdkConfig.tmpPath ? this.sdkConfig.tmpPath : os.tmpdir()
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

		await fs.writeFile(tmpFilePath, content)

		try {
			const item = await this.cloud.uploadLocalFile({
				source: tmpFilePath,
				parent: parentUUID,
				name: fileName,
				abortSignal,
				pauseSignal,
				onProgress
			})

			if (item.type === "file") {
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
	 * @date 2/15/2024 - 5:59:23 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		path: string
	 * 		destination: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal,
	 * 		onProgress?: ProgressCallback
	 * 	}} param0
	 * @param {string} param0.path
	 * @param {string} param0.destination
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @returns {Promise<void>}
	 */
	public async download({
		path,
		destination,
		abortSignal,
		pauseSignal,
		onProgress
	}: {
		path: string
		destination: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
	}): Promise<void> {
		if (environment !== "node") {
			throw new Error(`fs.download is not implemented for a ${environment} environment`)
		}

		path = this.normalizePath({ path })
		destination = normalizePath(destination)

		const uuid = await this.pathToItemUUID({ path })
		const item = this._items[path]

		if (!uuid || !item) {
			throw new ENOENT({ path })
		}

		if (item.type === "directory") {
			await this.cloud.downloadDirectoryToLocal({ uuid, to: destination, abortSignal, pauseSignal, onProgress })

			return
		}

		await this.cloud.downloadFileToLocal({
			uuid,
			bucket: item.metadata.bucket,
			region: item.metadata.region,
			chunks: item.metadata.chunks,
			version: item.metadata.version,
			key: item.metadata.key,
			to: destination,
			abortSignal,
			pauseSignal,
			onProgress
		})
	}

	/**
	 * Upload a file to path from a local source path. Recursively creates intermediate directories if needed. Only available in a Node.JS environment.
	 * @date 2/16/2024 - 5:32:17 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		path: string
	 * 		source: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 	}} param0
	 * @param {string} param0.path
	 * @param {string} param0.source
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @returns {Promise<void>}
	 */
	public async upload({
		path,
		source,
		abortSignal,
		pauseSignal,
		onProgress
	}: {
		path: string
		source: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
	}): Promise<CloudItem> {
		if (environment !== "node") {
			throw new Error(`fs.upload is not implemented for a ${environment} environment`)
		}

		path = this.normalizePath({ path })
		source = normalizePath(source)

		const parentPath = pathModule.posix.dirname(path)
		let parentUUID = ""
		const fileName = pathModule.posix.basename(path)

		if (fileName.length === 0 || fileName === "." || fileName === "/") {
			throw new Error("Could not parse file name.")
		}

		if (parentPath === "/" || parentPath === "." || parentPath === "") {
			parentUUID = this.sdkConfig.baseFolderUUID!
		} else {
			await this.mkdir({ path: parentPath })

			const parentItemUUID = await this.pathToItemUUID({ path: parentPath, type: "directory" })
			const parentItem = this._items[parentPath]

			if (!parentItemUUID || !parentItem) {
				throw new Error(`Could not find parent for path ${path}`)
			}

			parentUUID = parentItem.uuid
		}

		const item = await this.cloud.uploadLocalFile({ source, parent: parentUUID, name: fileName, abortSignal, pauseSignal, onProgress })

		if (item.type === "file") {
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
		}

		return item
	}

	/**
	 * Copy a file or directory structure. Recursively creates intermediate directories if needed.
	 * Warning: Can be really inefficient when copying large directory structures.
	 * All files need to be downloaded first and then reuploaded due to our end to end encryption.
	 * Plain copying unfortunately does not work. Only available in a Node.JS environment.
	 * @date 2/14/2024 - 5:06:04 AM
	 *
	 * @public
	 * @async
	 * @param {{ from: string; to: string }} param0
	 * @param {string} param0.from
	 * @param {string} param0.to
	 * @returns {Promise<void>}
	 */
	public async cp({
		from,
		to,
		abortSignal,
		pauseSignal,
		onProgress
	}: {
		from: string
		to: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
	}): Promise<void> {
		if (environment !== "node") {
			throw new Error(`fs.cp is not implemented for a ${environment} environment`)
		}

		from = this.normalizePath({ path: from })
		to = this.normalizePath({ path: to })

		if (from === "/" || from === to) {
			return
		}

		const uuid = await this.pathToItemUUID({ path: from })
		const item = this._items[from]

		if (!uuid || !item) {
			throw new ENOENT({ path: from })
		}

		const parentPath = pathModule.posix.dirname(to)
		let parentUUID = ""

		if (parentPath === "/" || parentPath === "." || parentPath === "") {
			parentUUID = this.sdkConfig.baseFolderUUID!
		} else {
			await this.mkdir({ path: parentPath })

			const parentItemUUID = await this.pathToItemUUID({ path: parentPath, type: "directory" })
			const parentItem = this._items[parentPath]

			if (!parentItemUUID || !parentItem) {
				throw new Error(`Could not find parent for path ${to}`)
			}

			parentUUID = parentItem.uuid
		}

		if (item.type === "directory") {
			const tmpDir = this.sdkConfig.tmpPath ? this.sdkConfig.tmpPath : os.tmpdir()
			const baseDirectoryName = pathModule.posix.basename(from)

			if (!baseDirectoryName || baseDirectoryName.length === 0 || baseDirectoryName === ".") {
				throw new Error("Could not parse baseDirectoryName.")
			}

			const newDirectoryName = pathModule.posix.basename(to)

			if (!newDirectoryName || newDirectoryName.length === 0 || newDirectoryName === ".") {
				throw new Error("Could not parse newDirectoryName.")
			}

			const tmpDirectoryPath = normalizePath(pathModule.join(tmpDir, "filen-sdk", await uuidv4(), newDirectoryName))

			await this.cloud.downloadDirectoryToLocal({ uuid, to: tmpDirectoryPath })

			try {
				await this.cloud.uploadLocalDirectory({
					source: tmpDirectoryPath,
					parent: parentUUID,
					abortSignal,
					pauseSignal,
					onProgress,
					name: newDirectoryName
				})

				await this.readdir({ path: to, recursive: true })
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

			const tmpFilePath = await this.cloud.downloadFileToLocal({
				uuid,
				bucket: item.metadata.bucket,
				region: item.metadata.region,
				chunks: item.metadata.chunks,
				version: item.metadata.version,
				key: item.metadata.key,
				abortSignal,
				pauseSignal,
				onProgress
			})

			try {
				const uploadedItem = await this.cloud.uploadLocalFile({
					source: tmpFilePath,
					parent: parentUUID,
					abortSignal,
					pauseSignal,
					onProgress,
					name: newFileName
				})

				if (uploadedItem.type === "file") {
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
