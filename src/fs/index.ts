import type API from "../api"
import type Crypto from "../crypto"
import type { FilenSDKConfig } from ".."
import type { FolderMetadata, FileMetadata, FileEncryptionVersion, ProgressCallback } from "../types"
import pathModule from "path"
import { ENOENT } from "./errors"
import { BUFFER_SIZE } from "../constants"
import type Cloud from "../cloud"
import type { PauseSignal } from "../cloud/signals"
import fs from "fs-extra"
import { uuidv4 } from "../utils"
import os from "os"

export type FSConfig = {
	sdkConfig: FilenSDKConfig
	api: API
	crypto: Crypto
	cloud: Cloud
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
			metadata: FolderMetadata & {
				timestamp: number
			}
	  })
	| (FSItemBase & {
			type: "file"
			metadata: FSItemFileBase &
				FileMetadata & {
					timestamp: number
				}
	  })

export type FSItems = Record<string, FSItem>

export type FSStats = {
	size: number
	mtimeMs: number
	birthtimeMs: number
	isDirectory: () => boolean
	isFile: () => boolean
	isSymbolicLink: () => boolean
}

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
	private readonly crypto: Crypto
	private readonly sdkConfig: FilenSDKConfig
	private readonly cloud: Cloud
	private _items: FSItems
	private _fileDescriptorsPaths: Record<string, number>
	private _fileDescriptorsIds: Record<number, string>
	private _nextFileDescriptor: number

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
		this.crypto = params.crypto
		this.sdkConfig = params.sdkConfig
		this.cloud = params.cloud

		this._items = {
			"/": {
				uuid: this.sdkConfig.baseFolderUUID!,
				type: "directory",
				metadata: {
					name: "Cloud Drive",
					timestamp: 0
				}
			}
		}

		this._fileDescriptorsPaths = {}
		this._fileDescriptorsIds = {}
		this._nextFileDescriptor = 0
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

		if (this._items[path]) {
			return this._items[path].uuid
		}

		const pathEx = path.split("/")
		let builtPath = "/"

		for (const part of pathEx) {
			if (pathEx.length <= 0) {
				continue
			}

			builtPath = pathModule.posix.join(builtPath, part)

			if (this._items[builtPath] && builtPath === path && acceptedTypes.includes(this._items[builtPath].type)) {
				return this._items[builtPath].uuid
			}

			const parentDirname = pathModule.posix.dirname(builtPath)

			if (this._items[parentDirname]) {
				await this.readdir({ path: parentDirname })
			}

			if (this._items[builtPath] && builtPath === path && acceptedTypes.includes(this._items[builtPath].type)) {
				return this._items[builtPath].uuid
			}
		}

		if (this._items[builtPath] && builtPath === path && acceptedTypes.includes(this._items[builtPath].type)) {
			return this._items[builtPath].uuid
		}

		return null
	}

	/**
	 * List files and folders at path.
	 * @date 2/9/2024 - 6:05:44 AM
	 *
	 * @public
	 * @async
	 * @param {{ path: string }} param0
	 * @param {string} param0.path
	 * @returns {Promise<string[]>}
	 */
	public async readdir({ path }: { path: string }): Promise<string[]> {
		path = this.normalizePath({ path })

		const uuid = await this.pathToItemUUID({ path })

		if (!uuid) {
			return []
		}

		if (uuid !== this.sdkConfig.baseFolderUUID!) {
			const present = await this.api.v3().dir().present({ uuid })

			if (!present.present) {
				return []
			}
		}

		const items = await this.cloud.listDirectory({ uuid })
		const names: string[] = []

		for (const item of items) {
			const itemPath = pathModule.posix.join(path, item.name)

			names.push(item.name)

			if (item.type === "directory") {
				this._items[itemPath] = {
					uuid: item.uuid,
					type: "directory",
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
						timestamp: item.timestamp,
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

	/**
	 * Alias of readdir.
	 * @date 2/13/2024 - 8:48:40 PM
	 *
	 * @public
	 * @async
	 * @param {...Parameters<typeof this.readdir>} params
	 * @returns {ReturnType<typeof this.readdir>}
	 */
	public async ls(...params: Parameters<typeof this.readdir>): ReturnType<typeof this.readdir> {
		return await this.readdir(...params)
	}

	public async stat({ path }: { path: string }): Promise<FSStats> {
		path = this.normalizePath({ path })

		const uuid = await this.pathToItemUUID({ path })

		if (!uuid) {
			throw new ENOENT({ path })
		}

		const item = this._items[path]

		if (!item) {
			throw new ENOENT({ path })
		}

		if (item.type === "file") {
			return {
				size: item.metadata.size,
				mtimeMs: item.metadata.lastModified,
				birthtimeMs: item.metadata.creation ?? item.metadata.timestamp,
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
			size: 0,
			mtimeMs: item.metadata.timestamp,
			birthtimeMs: item.metadata.timestamp,
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
	 * @returns {ReturnType<typeof this.stat>}
	 */
	public async lstat(...params: Parameters<typeof this.stat>): ReturnType<typeof this.stat> {
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
	 * @returns {Promise<void>}
	 */
	public async mkdir({ path }: { path: string }): Promise<void> {
		path = this.normalizePath({ path })

		if (path === "/") {
			return
		}

		const exists = await this.pathToItemUUID({ path })

		if (exists) {
			return
		}

		const parentPath = pathModule.posix.dirname(path)
		const basename = pathModule.posix.basename(path)

		if (parentPath === "/" || parentPath === "." || parentPath === "") {
			const uuid = await this.cloud.createDirectory({ name: basename, parent: this.sdkConfig.baseFolderUUID! })

			this._items[path] = {
				uuid,
				type: "directory",
				metadata: {
					name: basename,
					timestamp: Date.now()
				}
			}

			return
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
						name: partBasename,
						timestamp: Date.now()
					}
				}
			}
		}

		if (!this._items[path]) {
			throw new ENOENT({ path })
		}
	}

	/**
	 * Rename or move a file/folder. Recursively creates intermediate directories if needed.
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

		if (newParentPath === currentParentPath) {
			if (to === "/" || newBasename.length <= 0) {
				return
			}

			if (item.type === "directory") {
				await this.cloud.renameDirectory({ uuid, name: newBasename })
			} else {
				await this.cloud.renameFile({
					uuid,
					metadata: {
						...item.metadata,
						name: newBasename
					},
					name: newBasename
				})
			}
		} else {
			if (oldBasename !== newBasename) {
				if (item.type === "directory") {
					await this.cloud.renameDirectory({ uuid, name: newBasename })
				} else {
					await this.cloud.renameFile({
						uuid,
						metadata: {
							...item.metadata,
							name: newBasename
						},
						name: newBasename
					})
				}
			}

			if (newParentPath === "/" || newParentPath === "." || newParentPath === "") {
				if (item.type === "directory") {
					await this.cloud.moveDirectory({ uuid, to: this.sdkConfig.baseFolderUUID! })
				} else {
					await this.cloud.moveFile({ uuid, to: this.sdkConfig.baseFolderUUID! })
				}
			} else {
				await this.mkdir({ path: newParentPath })

				const newParentItem = this._items[newParentPath]

				if (!newParentItem) {
					throw new ENOENT({ path: newParentPath })
				}

				if (item.type === "directory") {
					await this.cloud.moveDirectory({ uuid, to: newParentItem.uuid! })
				} else {
					await this.cloud.moveFile({ uuid, to: newParentItem.uuid })
				}
			}
		}

		this._items[to] = this._items[from]

		delete this._items[from]
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
	 * Deletes file/folder at path (Sends it to the trash).
	 * @date 2/14/2024 - 2:16:42 AM
	 *
	 * @public
	 * @async
	 * @param {{ path: string }} param0
	 * @param {string} param0.path
	 * @returns {Promise<void>}
	 */
	private async _unlink({ path, type }: { path: string; type?: FSItemType }): Promise<void> {
		path = this.normalizePath({ path })

		const uuid = await this.pathToItemUUID({ path })

		if (!uuid || !this._items[path]) {
			throw new ENOENT({ path })
		}

		const acceptedTypes: FSItemType[] = !type ? ["directory", "file"] : type === "directory" ? ["directory"] : ["file"]

		if (!acceptedTypes.includes(this._items[path].type)) {
			throw new ENOENT({ path })
		}

		if (this._items[path].type === "directory") {
			await this.cloud.trashDirectory({ uuid })
		} else {
			await this.cloud.trashFile({ uuid })
		}

		delete this._items[path]
	}

	/**
	 * Deletes file/folder at path (Sends it to the trash).
	 * @date 2/14/2024 - 2:55:28 AM
	 *
	 * @public
	 * @async
	 * @param {{path: string}} param0
	 * @param {string} param0.path
	 * @returns {ReturnType<typeof this._unlink>}
	 */
	public async unlink({ path }: { path: string }): ReturnType<typeof this._unlink> {
		return await this._unlink({ path })
	}

	/**
	 * Alias of unlink.
	 * @date 2/14/2024 - 2:55:33 AM
	 *
	 * @public
	 * @async
	 * @param {{path: string}} param0
	 * @param {string} param0.path
	 * @returns {ReturnType<typeof this._unlink>}
	 */
	public async rm({ path }: { path: string }): ReturnType<typeof this._unlink> {
		return await this._unlink({ path })
	}

	/**
	 * Deletes folder at path (Sends it to the trash).
	 * @date 2/14/2024 - 2:53:48 AM
	 *
	 * @public
	 * @async
	 * @param {...Parameters<typeof this.unlink>} params
	 * @returns {ReturnType<typeof this.unlink>}
	 */
	public async rmdir(...params: Parameters<typeof this.unlink>): ReturnType<typeof this.unlink> {
		return await this._unlink({ path: params[0].path, type: "directory" })
	}

	/**
	 * Returns a file descriptor ID used for reading and writing.
	 * @date 2/14/2024 - 4:45:55 AM
	 *
	 * @public
	 * @async
	 * @param {{path: string}} param0
	 * @param {string} param0.path
	 * @returns {Promise<number>}
	 */
	public async open({ path, mode = "r" }: { path: string; mode?: "r" | "w" | "rw" }): Promise<number> {
		path = this.normalizePath({ path })

		if (mode === "r" || mode === "rw") {
			const uuid = await this.pathToItemUUID({ path })

			if (!uuid || !this._items[path]) {
				throw new ENOENT({ path })
			}
		}

		if (this._fileDescriptorsPaths[path]) {
			return this._fileDescriptorsPaths[path]
		}

		const nextFd = this._nextFileDescriptor++

		this._fileDescriptorsPaths[path] = nextFd
		this._fileDescriptorsIds[nextFd] = path

		return this._fileDescriptorsPaths[path]
	}

	/**
	 * Close a file descriptor.
	 * @date 2/14/2024 - 4:58:38 AM
	 *
	 * @public
	 * @async
	 * @param {{fd: number}} param0
	 * @param {number} param0.fd
	 * @returns {Promise<void>}
	 */
	public async close({ fd }: { fd: number }): Promise<void> {
		const path = this._fileDescriptorsIds[fd]

		if (path) {
			delete this._fileDescriptorsPaths[path]
		}

		delete this._fileDescriptorsIds[fd]
	}

	/*public async read({
		fd,
		buffer,
		offset,
		length,
		position
	}: {
		fd: number
		buffer: Buffer
		offset: number
		length: number
		position: number
	}): Promise<Buffer> {
		// @TODO
	}*/

	/*public async write({
		fd,
		buffer,
		offset,
		length,
		position
	}: {
		fd: number
		buffer: Buffer
		offset?: number
		length?: number
		position?: number
	}): Promise<void> {
		// @TODO
	}*/

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
	 * 		onProgress: ProgressCallback
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
		onProgress: ProgressCallback
	}): Promise<Buffer> {
		path = this.normalizePath({ path })

		const uuid = await this.pathToItemUUID({ path })
		const item = this._items[path]

		if (!uuid || !item || item.type === "directory") {
			throw new ENOENT({ path })
		}

		const stream = await this.cloud.downloadFileToReadableStream({
			uuid: uuid,
			bucket: item.metadata.bucket,
			region: item.metadata.region,
			chunks: item.metadata.chunks,
			version: item.metadata.version,
			key: item.metadata.key,
			abortSignal,
			pauseSignal,
			onProgress
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

		return buffer
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
	 * 		onProgress: ProgressCallback
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
		onProgress: ProgressCallback
	}): Promise<void> {
		path = this.normalizePath({ path })

		const parentPath = pathModule.posix.dirname(path)
		let parentUUID = ""

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
		const tmpFilePath = pathModule.join(tmpDir, "filen-sdk-tmp", await uuidv4())

		await fs.writeFile(tmpFilePath, content)

		try {
			await this.cloud.uploadFileFromLocal({ source: tmpFilePath, parent: parentUUID, abortSignal, pauseSignal, onProgress })
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
	 * Download a file from path to a local destination path. Only available in a Node.JS environment.
	 * @date 2/15/2024 - 5:59:23 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		path: string
	 * 		destination: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal,
	 * 		progress: ProgressCallback
	 * 	}} param0
	 * @param {string} param0.path
	 * @param {string} param0.destination
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {ProgressCallback} param0.progress
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
		onProgress: ProgressCallback
	}): Promise<void> {
		path = this.normalizePath({ path })

		const uuid = await this.pathToItemUUID({ path })
		const item = this._items[path]

		if (!uuid || !item || item.type === "directory") {
			throw new ENOENT({ path })
		}

		await this.cloud.downloadFileToLocal({
			uuid: uuid,
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
	 * 		onProgress: ProgressCallback
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
		onProgress: ProgressCallback
	}): Promise<void> {
		path = this.normalizePath({ path })

		const parentPath = pathModule.posix.dirname(path)
		let parentUUID = ""

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

		await this.cloud.uploadFileFromLocal({ source, parent: parentUUID, abortSignal, pauseSignal, onProgress })
	}

	/**
	 * Copy a file or directory structure. Recursively creates intermediate directories if needed.
	 * Warning: Can be really inefficient when copying large directory structures.
	 * All files and folders need to be downloaded first and then reuploaded due to our end to end encryption.
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
	public async cp({ from, to }: { from: string; to: string }): Promise<void> {
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
	}

	/**
	 * Alias of cp.
	 * @date 2/14/2024 - 5:07:27 AM
	 *
	 * @public
	 * @async
	 * @param {...Parameters<typeof this.cp>} params
	 * @returns {ReturnType<typeof this.cp>}
	 */
	public async copy(...params: Parameters<typeof this.cp>): ReturnType<typeof this.cp> {
		return await this.cp(...params)
	}
}

export default FS
