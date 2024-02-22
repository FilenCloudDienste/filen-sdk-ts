import type API from "../api"
import type Crypto from "../crypto"
import type { FilenSDKConfig } from ".."
import type { FileEncryptionVersion, FileMetadata, ProgressCallback, FolderMetadata, PublicLinkExpiration } from "../types"
import { convertTimestampToMs, promiseAllChunked, uuidv4, normalizePath, getEveryPossibleDirectoryPath } from "../utils"
import {
	environment,
	MAX_DOWNLOAD_THREADS,
	MAX_DOWNLOAD_WRITERS,
	MAX_UPLOAD_THREADS,
	CURRENT_FILE_ENCRYPTION_VERSION,
	DEFAULT_UPLOAD_BUCKET,
	DEFAULT_UPLOAD_REGION,
	UPLOAD_CHUNK_SIZE,
	MAX_CONCURRENT_LISTING_OPS,
	MAX_CONCURRENT_DOWNLOADS,
	MAX_CONCURRENT_UPLOADS,
	MAX_CONCURRENT_DIRECTORY_DOWNLOADS,
	MAX_CONCURRENT_DIRECTORY_UPLOADS
} from "../constants"
import { PauseSignal } from "./signals"
import pathModule from "path"
import os from "os"
import fs from "fs-extra"
import { Semaphore } from "../semaphore"
import appendStream from "../streams/append"
import type { DirColors, DirColor } from "../api/v3/dir/color"
import type { FileVersionsResponse } from "../api/v3/file/versions"
import type { DirDownloadType } from "../api/v3/dir/download"
import mimeTypes from "mime-types"
import utils from "./utils"

export type CloudConfig = {
	sdkConfig: FilenSDKConfig
	api: API
	crypto: Crypto
}

export type CloudItemReceiver = {
	id: number
	email: string
}

export type CloudItemBase = {
	uuid: string
	name: string
	timestamp: number
	favorited: boolean
	lastModified: number
	parent: string
}

export type CloudItemFile = {
	size: number
	mime: string
	rm: string
	version: FileEncryptionVersion
	chunks: number
	key: string
	bucket: string
	region: string
	creation?: number
	hash?: string
}

export type CloudItemBaseShared = Omit<CloudItemBase, "favorited">
export type CloudItemFileShared = Omit<CloudItemFile, "rm">

export type CloudItemDirectory = {
	color: DirColor | null
	size: number
}

export type CloudItem =
	| ({
			type: "directory"
	  } & CloudItemBase &
			CloudItemDirectory)
	| ({
			type: "file"
	  } & CloudItemBase &
			CloudItemFile)

export type CloudItemSharedReceiver = {
	id: number
	email: string
}

export type CloudItemSharedBase = {
	sharerEmail: string
	sharerId: number
	receiverEmail: string
	receiverId: number
	receivers: CloudItemSharedReceiver[]
}

export type CloudItemShared =
	| ({
			type: "directory"
	  } & CloudItemBaseShared &
			CloudItemDirectory &
			CloudItemSharedBase)
	| ({
			type: "file"
	  } & CloudItemBaseShared &
			CloudItemFileShared &
			CloudItemSharedBase)

export type CloudItemTree =
	| Omit<
			{
				type: "directory"
			} & CloudItemBase &
				CloudItemDirectory,
			"color" | "favorited" | "timestamp" | "lastModified"
	  >
	| Omit<
			{
				type: "file"
			} & CloudItemBase &
				CloudItemFile,
			"favorited" | "rm" | "timestamp"
	  >

export type FileToShare = {
	uuid: string
	parent: string
	metadata: FileMetadata
}

export type DirectoryToShare = {
	uuid: string
	parent: string
	metadata: FolderMetadata
}

/**
 * Cloud
 * @date 2/14/2024 - 11:29:58 PM
 *
 * @export
 * @class Cloud
 * @typedef {Cloud}
 */
export class Cloud {
	private readonly api: API
	private readonly crypto: Crypto
	private readonly sdkConfig: FilenSDKConfig

	private readonly _semaphores = {
		downloadThreads: new Semaphore(MAX_DOWNLOAD_THREADS),
		downloadWriters: new Semaphore(MAX_DOWNLOAD_WRITERS),
		uploadThreads: new Semaphore(MAX_UPLOAD_THREADS),
		listSemaphore: new Semaphore(MAX_CONCURRENT_LISTING_OPS),
		downloads: new Semaphore(MAX_CONCURRENT_DOWNLOADS),
		uploads: new Semaphore(MAX_CONCURRENT_UPLOADS),
		directoryDownloads: new Semaphore(MAX_CONCURRENT_DIRECTORY_DOWNLOADS),
		directoryUploads: new Semaphore(MAX_CONCURRENT_DIRECTORY_UPLOADS)
	}

	/**
	 * Creates an instance of Cloud.
	 * @date 2/14/2024 - 11:30:03 PM
	 *
	 * @constructor
	 * @public
	 * @param {CloudConfig} params
	 */
	public constructor(params: CloudConfig) {
		this.api = params.api
		this.crypto = params.crypto
		this.sdkConfig = params.sdkConfig
	}

	public readonly utils = {
		signals: {
			PauseSignal
		},
		utils
	}

	/**
	 * Lists all files and directories in a directory.
	 * @date 2/14/2024 - 11:39:25 PM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<CloudItem[]>}
	 */
	public async listDirectory({ uuid }: { uuid: string }): Promise<CloudItem[]> {
		const content = await this.api.v3().dir().content({ uuid })
		const items: CloudItem[] = []
		const promises: Promise<void>[] = []

		for (const folder of content.folders) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this._semaphores.listSemaphore
						.acquire()
						.then(() => {
							this.crypto
								.decrypt()
								.folderMetadata({ metadata: folder.name })
								.then(decrypted => {
									if (decrypted.name.length === 0) {
										resolve()

										return
									}

									const timestamp = convertTimestampToMs(folder.timestamp)

									items.push({
										type: "directory",
										uuid: folder.uuid,
										name: decrypted.name,
										lastModified: timestamp,
										timestamp,
										color: folder.color,
										parent: folder.parent,
										favorited: folder.favorited === 1,
										size: 0
									})

									resolve()
								})
								.catch(reject)
						})
						.catch(reject)
				).finally(() => {
					this._semaphores.listSemaphore.release()
				})
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this._semaphores.listSemaphore
						.acquire()
						.then(() => {
							this.crypto
								.decrypt()
								.fileMetadata({ metadata: file.metadata })
								.then(decrypted => {
									if (decrypted.name.length === 0) {
										resolve()

										return
									}

									items.push({
										type: "file",
										uuid: file.uuid,
										name: decrypted.name,
										size: decrypted.size,
										mime: decrypted.mime,
										lastModified: convertTimestampToMs(decrypted.lastModified),
										timestamp: convertTimestampToMs(file.timestamp),
										parent: file.parent,
										rm: file.rm,
										version: file.version,
										chunks: file.chunks,
										favorited: file.favorited === 1,
										key: decrypted.key,
										bucket: file.bucket,
										region: file.region,
										creation: decrypted.creation,
										hash: decrypted.hash
									})

									resolve()
								})
								.catch(reject)
						})
						.catch(reject)
				).finally(() => {
					this._semaphores.listSemaphore.release()
				})
			)
		}

		await promiseAllChunked(promises)

		return items
	}

	/**
	 * List shared in files and directories based on parent.
	 * @date 2/15/2024 - 1:16:49 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<CloudItemShared[]>}
	 */
	public async listDirectorySharedIn({ uuid }: { uuid: string }): Promise<CloudItemShared[]> {
		const content = await this.api.v3().shared().in({ uuid })
		const items: CloudItemShared[] = []
		const promises: Promise<void>[] = []

		for (const folder of content.folders) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this._semaphores.listSemaphore
						.acquire()
						.then(() => {
							this.crypto
								.decrypt()
								.folderMetadataPrivate({ metadata: folder.metadata })
								.then(decrypted => {
									if (decrypted.name.length === 0) {
										resolve()

										return
									}

									const timestamp = convertTimestampToMs(folder.timestamp)

									items.push({
										type: "directory",
										uuid: folder.uuid,
										name: decrypted.name,
										lastModified: timestamp,
										timestamp,
										color: folder.color,
										parent: folder.parent ?? "shared-in",
										sharerEmail: folder.sharerEmail,
										sharerId: folder.sharerId,
										receiverEmail: folder.receiverEmail ?? "",
										receiverId: folder.receiverId ?? 0,
										receivers: [],
										size: 0
									})

									resolve()
								})
								.catch(reject)
						})
						.catch(reject)
				).finally(() => {
					this._semaphores.listSemaphore.release()
				})
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this._semaphores.listSemaphore
						.acquire()
						.then(() => {
							this.crypto
								.decrypt()
								.fileMetadataPrivate({ metadata: file.metadata })
								.then(decrypted => {
									if (decrypted.name.length === 0) {
										resolve()

										return
									}

									items.push({
										type: "file",
										uuid: file.uuid,
										name: decrypted.name,
										size: decrypted.size,
										mime: decrypted.mime,
										lastModified: convertTimestampToMs(decrypted.lastModified),
										timestamp: convertTimestampToMs(file.timestamp),
										parent: file.parent,
										version: file.version,
										chunks: file.chunks,
										key: decrypted.key,
										bucket: file.bucket,
										region: file.region,
										creation: decrypted.creation,
										hash: decrypted.hash,
										sharerEmail: file.sharerEmail,
										sharerId: file.sharerId,
										receiverEmail: file.receiverEmail ?? "",
										receiverId: file.receiverId ?? 0,
										receivers: []
									})

									resolve()
								})
								.catch(reject)
						})
						.catch(reject)
				).finally(() => {
					this._semaphores.listSemaphore.release()
				})
			)
		}

		await promiseAllChunked(promises)

		return items
	}

	/**
	 * List shared out files and directories based on parent.
	 * @date 2/15/2024 - 1:16:32 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; receiverId?: number }} param0
	 * @param {string} param0.uuid
	 * @param {number} param0.receiverId
	 * @returns {Promise<CloudItemShared[]>}
	 */
	public async listDirectorySharedOut({ uuid, receiverId }: { uuid: string; receiverId?: number }): Promise<CloudItemShared[]> {
		const content = await this.api.v3().shared().out({ uuid, receiverId })
		const items: CloudItemShared[] = []
		const promises: Promise<void>[] = []

		for (const folder of content.folders) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this._semaphores.listSemaphore
						.acquire()
						.then(() => {
							this.crypto
								.decrypt()
								.folderMetadata({ metadata: folder.metadata })
								.then(decrypted => {
									if (decrypted.name.length === 0) {
										resolve()

										return
									}

									const timestamp = convertTimestampToMs(folder.timestamp)

									items.push({
										type: "directory",
										uuid: folder.uuid,
										name: decrypted.name,
										lastModified: timestamp,
										timestamp,
										color: folder.color,
										parent: folder.parent ?? "shared-in",
										sharerEmail: folder.sharerEmail,
										sharerId: folder.sharerId,
										receiverEmail: folder.receiverEmail ?? "",
										receiverId: folder.receiverId ?? 0,
										receivers: [],
										size: 0
									})

									resolve()
								})
								.catch(reject)
						})
						.catch(reject)
				).finally(() => {
					this._semaphores.listSemaphore.release()
				})
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this._semaphores.listSemaphore
						.acquire()
						.then(() => {
							this.crypto
								.decrypt()
								.fileMetadata({ metadata: file.metadata })
								.then(decrypted => {
									if (decrypted.name.length === 0) {
										resolve()

										return
									}

									items.push({
										type: "file",
										uuid: file.uuid,
										name: decrypted.name,
										size: decrypted.size,
										mime: decrypted.mime,
										lastModified: convertTimestampToMs(decrypted.lastModified),
										timestamp: convertTimestampToMs(file.timestamp),
										parent: file.parent,
										version: file.version,
										chunks: file.chunks,
										key: decrypted.key,
										bucket: file.bucket,
										region: file.region,
										creation: decrypted.creation,
										hash: decrypted.hash,
										sharerEmail: file.sharerEmail,
										sharerId: file.sharerId,
										receiverEmail: file.receiverEmail ?? "",
										receiverId: file.receiverId ?? 0,
										receivers: []
									})

									resolve()
								})
								.catch(reject)
						})
						.catch(reject)
				).finally(() => {
					this._semaphores.listSemaphore.release()
				})
			)
		}

		await promiseAllChunked(promises)

		const groups: CloudItemShared[] = []
		const sharedTo: Record<string, CloudItemReceiver[]> = {}
		const added: Record<string, boolean> = {}

		for (const item of items) {
			if (Array.isArray(sharedTo[item.uuid])) {
				sharedTo[item.uuid].push({
					id: item.receiverId,
					email: item.receiverEmail
				})
			} else {
				sharedTo[item.uuid] = [
					{
						id: item.receiverId,
						email: item.receiverEmail
					}
				]
			}
		}

		for (let i = 0; i < items.length; i++) {
			if (Array.isArray(sharedTo[items[i].uuid])) {
				items[i].receivers = sharedTo[items[i].uuid]
			}

			if (!added[items[i].uuid]) {
				added[items[i].uuid] = true

				groups.push(items[i])
			}
		}

		return groups
	}

	/**
	 * List all recently uploaded files.
	 * @date 2/15/2024 - 1:16:20 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<CloudItem[]>}
	 */
	public async listRecents(): Promise<CloudItem[]> {
		const content = await this.api.v3().dir().content({ uuid: "recents" })
		const items: CloudItem[] = []
		const promises: Promise<void>[] = []

		for (const file of content.uploads) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this._semaphores.listSemaphore
						.acquire()
						.then(() => {
							this.crypto
								.decrypt()
								.fileMetadata({ metadata: file.metadata })
								.then(decrypted => {
									if (decrypted.name.length === 0) {
										resolve()

										return
									}

									items.push({
										type: "file",
										uuid: file.uuid,
										name: decrypted.name,
										size: decrypted.size,
										mime: decrypted.mime,
										lastModified: convertTimestampToMs(decrypted.lastModified),
										timestamp: convertTimestampToMs(file.timestamp),
										parent: file.parent,
										rm: file.rm,
										version: file.version,
										chunks: file.chunks,
										favorited: file.favorited === 1,
										key: decrypted.key,
										bucket: file.bucket,
										region: file.region,
										creation: decrypted.creation,
										hash: decrypted.hash
									})

									resolve()
								})
								.catch(reject)
						})
						.catch(reject)
				).finally(() => {
					this._semaphores.listSemaphore.release()
				})
			)
		}

		await promiseAllChunked(promises)

		return items
	}

	/**
	 * List all files and directories inside the trash.
	 * @date 2/15/2024 - 8:59:04 PM
	 *
	 * @public
	 * @async
	 * @returns {Promise<CloudItem[]>}
	 */
	public async listTrash(): Promise<CloudItem[]> {
		const content = await this.api.v3().dir().content({ uuid: "trash" })
		const items: CloudItem[] = []
		const promises: Promise<void>[] = []

		for (const folder of content.folders) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this._semaphores.listSemaphore
						.acquire()
						.then(() => {
							this.crypto
								.decrypt()
								.folderMetadata({ metadata: folder.name })
								.then(decrypted => {
									if (decrypted.name.length === 0) {
										resolve()

										return
									}

									const timestamp = convertTimestampToMs(folder.timestamp)

									items.push({
										type: "directory",
										uuid: folder.uuid,
										name: decrypted.name,
										lastModified: timestamp,
										timestamp,
										color: folder.color,
										parent: folder.parent,
										favorited: folder.favorited === 1,
										size: 0
									})

									resolve()
								})
								.catch(reject)
						})
						.catch(reject)
				).finally(() => {
					this._semaphores.listSemaphore.release()
				})
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this._semaphores.listSemaphore
						.acquire()
						.then(() => {
							this.crypto
								.decrypt()
								.fileMetadata({ metadata: file.metadata })
								.then(decrypted => {
									if (decrypted.name.length === 0) {
										resolve()

										return
									}

									items.push({
										type: "file",
										uuid: file.uuid,
										name: decrypted.name,
										size: decrypted.size,
										mime: decrypted.mime,
										lastModified: convertTimestampToMs(decrypted.lastModified),
										timestamp: convertTimestampToMs(file.timestamp),
										parent: file.parent,
										rm: file.rm,
										version: file.version,
										chunks: file.chunks,
										favorited: file.favorited === 1,
										key: decrypted.key,
										bucket: file.bucket,
										region: file.region,
										creation: decrypted.creation,
										hash: decrypted.hash
									})

									resolve()
								})
								.catch(reject)
						})
						.catch(reject)
				).finally(() => {
					this._semaphores.listSemaphore.release()
				})
			)
		}

		await promiseAllChunked(promises)

		return items
	}

	/**
	 * List all favorite files and directories.
	 * @date 2/15/2024 - 8:59:52 PM
	 *
	 * @public
	 * @async
	 * @returns {Promise<CloudItem[]>}
	 */
	public async listFavorites(): Promise<CloudItem[]> {
		const content = await this.api.v3().dir().content({ uuid: "favorites" })
		const items: CloudItem[] = []
		const promises: Promise<void>[] = []

		for (const folder of content.folders) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this._semaphores.listSemaphore
						.acquire()
						.then(() => {
							this.crypto
								.decrypt()
								.folderMetadata({ metadata: folder.name })
								.then(decrypted => {
									if (decrypted.name.length === 0) {
										resolve()

										return
									}

									const timestamp = convertTimestampToMs(folder.timestamp)

									items.push({
										type: "directory",
										uuid: folder.uuid,
										name: decrypted.name,
										lastModified: timestamp,
										timestamp,
										color: folder.color,
										parent: folder.parent,
										favorited: folder.favorited === 1,
										size: 0
									})

									resolve()
								})
								.catch(reject)
						})
						.catch(reject)
				).finally(() => {
					this._semaphores.listSemaphore.release()
				})
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this._semaphores.listSemaphore
						.acquire()
						.then(() => {
							this.crypto
								.decrypt()
								.fileMetadata({ metadata: file.metadata })
								.then(decrypted => {
									if (decrypted.name.length === 0) {
										resolve()

										return
									}

									items.push({
										type: "file",
										uuid: file.uuid,
										name: decrypted.name,
										size: decrypted.size,
										mime: decrypted.mime,
										lastModified: convertTimestampToMs(decrypted.lastModified),
										timestamp: convertTimestampToMs(file.timestamp),
										parent: file.parent,
										rm: file.rm,
										version: file.version,
										chunks: file.chunks,
										favorited: file.favorited === 1,
										key: decrypted.key,
										bucket: file.bucket,
										region: file.region,
										creation: decrypted.creation,
										hash: decrypted.hash
									})

									resolve()
								})
								.catch(reject)
						})
						.catch(reject)
				).finally(() => {
					this._semaphores.listSemaphore.release()
				})
			)
		}

		await promiseAllChunked(promises)

		return items
	}

	/**
	 * List all public linked files and directories.
	 * @date 2/15/2024 - 9:01:01 PM
	 *
	 * @public
	 * @async
	 * @returns {Promise<CloudItem[]>}
	 */
	public async listPublicLinks(): Promise<CloudItem[]> {
		const content = await this.api.v3().dir().content({ uuid: "links" })
		const items: CloudItem[] = []
		const promises: Promise<void>[] = []

		for (const folder of content.folders) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this._semaphores.listSemaphore
						.acquire()
						.then(() => {
							this.crypto
								.decrypt()
								.folderMetadata({ metadata: folder.name })
								.then(decrypted => {
									if (decrypted.name.length === 0) {
										resolve()

										return
									}

									const timestamp = convertTimestampToMs(folder.timestamp)

									items.push({
										type: "directory",
										uuid: folder.uuid,
										name: decrypted.name,
										lastModified: timestamp,
										timestamp,
										color: folder.color,
										parent: folder.parent,
										favorited: folder.favorited === 1,
										size: 0
									})

									resolve()
								})
								.catch(reject)
						})
						.catch(reject)
				).finally(() => {
					this._semaphores.listSemaphore.release()
				})
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this._semaphores.listSemaphore
						.acquire()
						.then(() => {
							this.crypto
								.decrypt()
								.fileMetadata({ metadata: file.metadata })
								.then(decrypted => {
									if (decrypted.name.length === 0) {
										resolve()

										return
									}

									items.push({
										type: "file",
										uuid: file.uuid,
										name: decrypted.name,
										size: decrypted.size,
										mime: decrypted.mime,
										lastModified: convertTimestampToMs(decrypted.lastModified),
										timestamp: convertTimestampToMs(file.timestamp),
										parent: file.parent,
										rm: file.rm,
										version: file.version,
										chunks: file.chunks,
										favorited: file.favorited === 1,
										key: decrypted.key,
										bucket: file.bucket,
										region: file.region,
										creation: decrypted.creation,
										hash: decrypted.hash
									})

									resolve()
								})
								.catch(reject)
						})
						.catch(reject)
				).finally(() => {
					this._semaphores.listSemaphore.release()
				})
			)
		}

		await promiseAllChunked(promises)

		return items
	}

	/**
	 * Rename a file.
	 * @date 2/15/2024 - 1:23:33 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, metadata: FileMetadata, name: string}} param0
	 * @param {string} param0.uuid
	 * @param {FileMetadata} param0.metadata
	 * @param {string} param0.name
	 * @returns {Promise<void>}
	 */
	public async renameFile({ uuid, metadata, name }: { uuid: string; metadata: FileMetadata; name: string }): Promise<void> {
		const [nameHashed, metadataEncrypted, nameEncrypted] = await Promise.all([
			this.crypto.utils.hashFn({ input: name.toLowerCase() }),
			this.crypto.encrypt().metadata({
				metadata: JSON.stringify({
					...metadata,
					name
				})
			}),
			this.crypto.encrypt().metadata({ metadata: name, key: metadata.key })
		])

		await this.api.v3().file().rename({ uuid, metadataEncrypted, nameEncrypted, nameHashed })
		await this.checkIfItemIsSharedForRename({ uuid, itemMetadata: metadata })
	}

	/**
	 * Rename a directory.
	 * @date 2/15/2024 - 1:26:43 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, name: string}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.name
	 * @returns {Promise<void>}
	 */
	public async renameDirectory({ uuid, name }: { uuid: string; name: string }): Promise<void> {
		const [nameHashed, metadataEncrypted] = await Promise.all([
			this.crypto.utils.hashFn({ input: name.toLowerCase() }),
			this.crypto.encrypt().metadata({
				metadata: JSON.stringify({
					name
				})
			})
		])

		await this.api.v3().dir().rename({ uuid, metadataEncrypted, nameHashed })

		await this.checkIfItemIsSharedForRename({
			uuid,
			itemMetadata: {
				name
			}
		})
	}

	/**
	 * Move a file.
	 * @date 2/19/2024 - 1:13:32 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; to: string, metadata: FileMetadata }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.to
	 * @param {FileMetadata} param0.metadata
	 * @returns {Promise<void>}
	 */
	public async moveFile({ uuid, to, metadata }: { uuid: string; to: string; metadata: FileMetadata }): Promise<void> {
		await this.api.v3().file().move({ uuid, to })

		await this.checkIfItemParentIsShared({ type: "file", parent: to, uuid, itemMetadata: metadata })
	}

	/**
	 * Move a directory.
	 * @date 2/19/2024 - 1:14:04 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; to: string, metadata: FolderMetadata }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.to
	 * @param {FolderMetadata} param0.metadata
	 * @returns {Promise<void>}
	 */
	public async moveDirectory({ uuid, to, metadata }: { uuid: string; to: string; metadata: FolderMetadata }): Promise<void> {
		await this.api.v3().dir().move({ uuid, to })

		await this.checkIfItemParentIsShared({ type: "directory", parent: to, uuid, itemMetadata: metadata })
	}

	/**
	 * Send a file to the trash bin.
	 * @date 2/15/2024 - 2:07:13 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async trashFile({ uuid }: { uuid: string }): Promise<void> {
		await this.api.v3().file().trash({ uuid })
	}

	/**
	 * Send a directory to the trash bin.
	 * @date 2/15/2024 - 2:07:13 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async trashDirectory({ uuid }: { uuid: string }): Promise<void> {
		await this.api.v3().dir().trash({ uuid })
	}

	/**
	 * Create a directory under parent.
	 * @date 2/15/2024 - 2:27:36 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid?: string; name: string; parent: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.name
	 * @param {string} param0.parent
	 * @returns {Promise<string>}
	 */
	public async createDirectory({ uuid, name, parent }: { uuid?: string; name: string; parent: string }): Promise<string> {
		let uuidToUse = uuid ? uuid : await uuidv4()
		const exists = await this.api.v3().dir().exists({ name, parent })

		if (exists.exists) {
			uuidToUse = exists.existsUUID
		} else {
			const [metadataEncrypted, nameHashed] = await Promise.all([
				this.crypto.encrypt().metadata({ metadata: JSON.stringify({ name }) }),
				this.crypto.utils.hashFn({ input: name.toLowerCase() })
			])

			await this.api.v3().dir().create({ uuid: uuidToUse, metadataEncrypted, nameHashed, parent })

			await this.checkIfItemParentIsShared({
				type: "directory",
				parent,
				uuid: uuidToUse,
				itemMetadata: {
					name
				}
			})
		}

		return uuidToUse
	}

	/**
	 * Change the color of a directory.
	 * @date 2/15/2024 - 8:52:40 PM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, color: DirColors}} param0
	 * @param {string} param0.uuid
	 * @param {DirColors} param0.color
	 * @returns {Promise<void>}
	 */
	public async changeDirectoryColor({ uuid, color }: { uuid: string; color: DirColors }): Promise<void> {
		await this.api.v3().dir().color({ uuid, color })
	}

	/**
	 * Toggle the favorite status of a directory.
	 * @date 2/15/2024 - 8:54:03 PM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, favorite: boolean}} param0
	 * @param {string} param0.uuid
	 * @param {boolean} param0.favorite
	 * @returns {Promise<void>}
	 */
	public async favoriteDirectory({ uuid, favorite }: { uuid: string; favorite: boolean }): Promise<void> {
		await this.api.v3().item().favorite({ uuid, type: "folder", favorite })
	}

	/**
	 * Toggle the favorite status of a file.
	 * @date 2/15/2024 - 8:54:23 PM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, favorite: boolean}} param0
	 * @param {string} param0.uuid
	 * @param {boolean} param0.favorite
	 * @returns {Promise<void>}
	 */
	public async favoriteFile({ uuid, favorite }: { uuid: string; favorite: boolean }): Promise<void> {
		await this.api.v3().item().favorite({ uuid, type: "file", favorite })
	}

	/**
	 * Permanently delete a file.
	 * @date 2/15/2024 - 11:42:05 PM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async deleteFile({ uuid }: { uuid: string }): Promise<void> {
		await this.api.v3().file().delete().permanent({ uuid })
	}

	/**
	 * Permanently delete a directory.
	 * @date 2/15/2024 - 11:42:13 PM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async deleteDirectory({ uuid }: { uuid: string }): Promise<void> {
		await this.api.v3().dir().delete().permanent({ uuid })
	}

	/**
	 * Restore a file from the trash.
	 * @date 2/15/2024 - 11:43:21 PM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async restoreFile({ uuid }: { uuid: string }): Promise<void> {
		await this.api.v3().file().restore({ uuid })
	}

	/**
	 * Restore a directory from the trash.
	 * @date 2/15/2024 - 11:43:29 PM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async restoreDirectory({ uuid }: { uuid: string }): Promise<void> {
		await this.api.v3().dir().restore({ uuid })
	}

	/**
	 * Restore a file version.
	 * @date 2/15/2024 - 11:44:51 PM
	 *
	 * @public
	 * @async
	 * @param {{uuid:string, currentUUID:string}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.currentUUID
	 * @returns {Promise<void>}
	 */
	public async restoreFileVersion({ uuid, currentUUID }: { uuid: string; currentUUID: string }): Promise<void> {
		await this.api.v3().file().version().restore({ uuid, currentUUID })
	}

	/**
	 * Retrieve all versions of a file.
	 * @date 2/15/2024 - 11:46:38 PM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<FileVersionsResponse>}
	 */
	public async fileVersions({ uuid }: { uuid: string }): Promise<FileVersionsResponse> {
		return await this.api.v3().file().versions({ uuid })
	}

	/**
	 * Share an item to another Filen user.
	 * @date 2/17/2024 - 4:11:05 AM
	 *
	 * @private
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		parent: string
	 * 		email: string
	 * 		type: "file" | "folder"
	 * 		publicKey: string
	 * 		metadata: FileMetadata | FolderMetadata
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.parent
	 * @param {string} param0.email
	 * @param {("file" | "folder")} param0.type
	 * @param {string} param0.publicKey
	 * @param {*} param0.metadata
	 * @returns {Promise<void>}
	 */
	private async shareItem({
		uuid,
		parent,
		email,
		type,
		publicKey,
		metadata
	}: {
		uuid: string
		parent: string
		email: string
		type: "file" | "folder"
		publicKey: string
		metadata: FileMetadata | FolderMetadata
	}): Promise<void> {
		const metadataEncrypted = await this.crypto.encrypt().metadataPublic({ metadata: JSON.stringify(metadata), publicKey })

		await this.api.v3().item().share({ uuid, parent, email, type, metadata: metadataEncrypted })
	}

	/**
	 * Add an item to a directory public link.
	 * @date 2/19/2024 - 5:08:51 AM
	 *
	 * @private
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		parent: string
	 * 		linkUUID: string
	 * 		type: "file" | "folder"
	 * 		metadata: FileMetadata | FolderMetadata
	 * 		linkKeyEncrypted: string
	 * 		expiration: PublicLinkExpiration
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.parent
	 * @param {string} param0.linkUUID
	 * @param {("file" | "folder")} param0.type
	 * @param {*} param0.metadata
	 * @param {string} param0.linkKeyEncrypted
	 * @param {PublicLinkExpiration} param0.expiration
	 * @returns {Promise<void>}
	 */
	private async addItemToDirectoryPublicLink({
		uuid,
		parent,
		linkUUID,
		type,
		metadata,
		linkKeyEncrypted,
		expiration
	}: {
		uuid: string
		parent: string
		linkUUID: string
		type: "file" | "folder"
		metadata: FileMetadata | FolderMetadata
		linkKeyEncrypted: string
		expiration: PublicLinkExpiration
	}): Promise<void> {
		const key = await this.crypto.decrypt().folderLinkKey({ metadata: linkKeyEncrypted })
		const metadataEncrypted = await this.crypto.encrypt().metadata({ metadata: JSON.stringify(metadata), key })

		await this.api
			.v3()
			.dir()
			.link()
			.add({ uuid, parent, linkUUID, type, metadata: metadataEncrypted, key: linkKeyEncrypted, expiration })
	}

	/**
	 * Enable a public link for a file or a directory.
	 * @date 2/19/2024 - 5:13:57 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		type: "file" | "directory"
	 * 		uuid: string
	 * 		onProgress?: ProgressCallback
	 * 	}} param0
	 * @param {("file" | "directory")} param0.type
	 * @param {string} param0.uuid
	 * @param {ProgressCallback} param0.onProgress
	 * @returns {Promise<string>}
	 */
	public async enablePublicLink({
		type,
		uuid,
		onProgress
	}: {
		type: "file" | "directory"
		uuid: string
		onProgress?: ProgressCallback
	}): Promise<string> {
		const linkUUID = await uuidv4()

		if (type === "directory") {
			const [tree, key] = await Promise.all([this.getDirectoryTree({ uuid }), this.crypto.utils.generateRandomString({ length: 32 })])
			const linkKeyEncrypted = await this.crypto.encrypt().metadata({ metadata: key })
			let done = 0
			const promises: Promise<void>[] = []

			for (const entry in tree) {
				const item = tree[entry]

				promises.push(
					new Promise((resolve, reject) => {
						this.addItemToDirectoryPublicLink({
							uuid: item.uuid,
							parent: item.parent,
							linkUUID,
							type: item.type === "directory" ? "folder" : "file",
							expiration: "never",
							linkKeyEncrypted,
							metadata:
								item.type === "directory"
									? ({ name: item.name } satisfies FolderMetadata)
									: ({
											name: item.name,
											size: item.size,
											mime: item.mime,
											lastModified: item.lastModified,
											key: item.key,
											creation: item.creation,
											hash: item.hash
									  } satisfies FileMetadata)
						})
							.then(() => {
								done += 1

								if (onProgress) {
									onProgress(done)
								}

								resolve()
							})
							.catch(reject)
					})
				)
			}

			await promiseAllChunked(promises)

			return linkUUID
		}

		await this.api
			.v3()
			.file()
			.link()
			.edit({
				uuid: linkUUID,
				fileUUID: uuid,
				expiration: "never",
				password: "empty",
				passwordHashed: await this.crypto.utils.hashFn({ input: "empty" }),
				downloadBtn: true,
				type: "enable",
				salt: await this.crypto.utils.generateRandomString({ length: 32 })
			})

		return linkUUID
	}

	/**
	 * Edit a file/directory public link.
	 * @date 2/19/2024 - 4:57:03 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		type: "file" | "directory"
	 * 		itemUUID: string
	 * 		linkUUID?: string
	 * 		password?: string
	 * 		enableDownload?: boolean
	 * 		expiration: PublicLinkExpiration
	 * 	}} param0
	 * @param {("file" | "directory")} param0.type
	 * @param {string} param0.itemUUID
	 * @param {string} param0.linkUUID
	 * @param {string} param0.password
	 * @param {boolean} [param0.enableDownload=true]
	 * @param {PublicLinkExpiration} [param0.expiration="never"]
	 * @returns {Promise<void>}
	 */
	public async editPublicLink({
		type,
		itemUUID,
		linkUUID,
		password,
		enableDownload = true,
		expiration = "never"
	}: {
		type: "file" | "directory"
		itemUUID: string
		linkUUID?: string
		password?: string
		enableDownload?: boolean
		expiration: PublicLinkExpiration
	}): Promise<void> {
		const salt = await this.crypto.utils.generateRandomString({ length: 32 })
		const pass = password && password.length > 0 ? "notempty" : "empty"
		const passHashed =
			password && password.length > 0
				? await this.crypto.utils.deriveKeyFromPassword({
						password,
						salt,
						iterations: 200000,
						hash: "sha512",
						bitLength: 512,
						returnHex: true
				  })
				: "empty"

		if (type === "directory") {
			await this.api
				.v3()
				.dir()
				.link()
				.edit({ uuid: itemUUID, expiration, password: pass, passwordHashed: passHashed, salt, downloadBtn: enableDownload })

			return
		}

		if (!linkUUID) {
			throw new Error("[cloud.disablePublicLink] linkUUID undefined, expected: UUIDv4 string")
		}

		await this.api.v3().file().link().edit({
			uuid: linkUUID,
			fileUUID: itemUUID,
			expiration,
			password: pass,
			passwordHashed: passHashed,
			salt,
			downloadBtn: enableDownload,
			type: "enable"
		})
	}

	public async disablePublicLink({ type, itemUUID }: { type: "directory"; itemUUID: string }): Promise<void>
	public async disablePublicLink({ type, itemUUID, linkUUID }: { type: "file"; itemUUID: string; linkUUID: string }): Promise<void>

	/**
	 * Disable a file/directory public link.
	 * @date 2/19/2024 - 4:47:27 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		type: "file" | "directory"
	 * 		linkUUID?: string
	 * 		itemUUID: string
	 * 	}} param0
	 * @param {("file" | "directory")} param0.type
	 * @param {string} param0.linkUUID
	 * @param {string} param0.itemUUID
	 * @returns {Promise<void>}
	 */
	public async disablePublicLink({
		type,
		linkUUID,
		itemUUID
	}: {
		type: "file" | "directory"
		linkUUID?: string
		itemUUID: string
	}): Promise<void> {
		if (type === "directory") {
			await this.api.v3().dir().link().remove({ uuid: itemUUID })

			return
		}

		if (!linkUUID) {
			throw new Error("[cloud.disablePublicLink] linkUUID undefined, expected: UUIDv4 string")
		}

		await this.api
			.v3()
			.file()
			.link()
			.edit({
				uuid: linkUUID,
				fileUUID: itemUUID,
				expiration: "never",
				password: "empty",
				passwordHashed: await this.crypto.utils.hashPassword({ password: "empty" }),
				salt: await this.crypto.utils.generateRandomString({ length: 32 }),
				downloadBtn: true,
				type: "disable"
			})
	}

	/**
	 * Stop sharing an item with another user.
	 * @date 2/19/2024 - 4:38:21 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; receiverId: number }} param0
	 * @param {string} param0.uuid
	 * @param {number} param0.receiverId
	 * @returns {Promise<void>}
	 */
	public async stopSharingItem({ uuid, receiverId }: { uuid: string; receiverId: number }): Promise<void> {
		await this.api.v3().item().sharedOut().remove({ uuid, receiverId })
	}

	/**
	 * Stop receiving a shared item.
	 * @date 2/19/2024 - 4:38:36 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async removeSharedItem({ uuid }: { uuid: string }): Promise<void> {
		await this.api.v3().item().sharedIn().remove({ uuid })
	}

	/**
	 * Share a file or a directory (and all it's children) to a user.
	 * @date 2/19/2024 - 4:35:03 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		files: { uuid: string; parent: string; metadata: FileMetadata }[]
	 * 		directories: { uuid: string; parent: string; metadata: FolderMetadata }[]
	 * 		email: string
	 * 		onProgress?: ProgressCallback
	 * 	}} param0
	 * @param {{}} param0.files
	 * @param {{}} param0.directories
	 * @param {string} param0.email
	 * @param {ProgressCallback} param0.onProgress
	 * @returns {Promise<void>}
	 */
	public async shareItemsToUser({
		files,
		directories,
		email,
		onProgress
	}: {
		files: { uuid: string; parent: string; metadata: FileMetadata }[]
		directories: { uuid: string; parent: string; metadata: FolderMetadata }[]
		email: string
		onProgress?: ProgressCallback
	}): Promise<void> {
		const publicKey = (await this.api.v3().user().publicKey({ email })).publicKey
		const itemsToShare: { type: "file" | "folder"; uuid: string; parent: string; metadata: FileMetadata | FolderMetadata }[] = []

		for (const file of files) {
			itemsToShare.push({
				...file,
				metadata: file.metadata satisfies FileMetadata,
				parent: "none",
				type: "file"
			})
		}

		const directoryPromises: Promise<void>[] = []

		for (const directory of directories) {
			itemsToShare.push({
				...directory,
				metadata: directory.metadata satisfies FolderMetadata,
				parent: "none",
				type: "folder"
			})

			directoryPromises.push(
				new Promise((resolve, reject) => {
					this.getDirectoryTree({ uuid: directory.uuid })
						.then(tree => {
							for (const entry in tree) {
								const item = tree[entry]

								if (item.parent === "base" || item.uuid === directory.uuid) {
									continue
								}

								if (item.type === "directory") {
									itemsToShare.push({
										uuid: item.uuid,
										metadata: {
											name: item.name
										} satisfies FolderMetadata,
										parent: item.parent,
										type: "folder"
									})
								} else {
									itemsToShare.push({
										uuid: item.uuid,
										metadata: {
											name: item.name,
											size: item.size,
											mime: item.mime,
											lastModified: item.lastModified,
											key: item.key,
											creation: item.creation,
											hash: item.hash
										} satisfies FileMetadata,
										parent: item.parent,
										type: "file"
									})
								}
							}

							resolve()
						})
						.catch(reject)
				})
			)
		}

		await promiseAllChunked(directoryPromises)

		const sharePromises: Promise<void>[] = []
		let done = 0

		for (const item of itemsToShare) {
			sharePromises.push(
				new Promise((resolve, reject) => {
					this.shareItem({
						uuid: item.uuid,
						parent: item.parent,
						email,
						type: item.type,
						publicKey,
						metadata: item.metadata
					})
						.then(() => {
							done += 1

							if (onProgress) {
								onProgress(done)
							}

							resolve()
						})
						.catch(reject)
				})
			)
		}

		await promiseAllChunked(sharePromises)
	}

	/**
	 * Checks if the parent of an item is shared or public linked.
	 * If so, it adds the item and all children of the item (in case of a directory) to the share or public link.
	 * @date 2/17/2024 - 4:26:44 AM
	 *
	 * @private
	 * @async
	 * @param {{
	 * 		type: "file" | "directory"
	 * 		parent: string
	 * 		uuid: string
	 * 		itemMetadata: FileMetadata | FolderMetadata
	 * 	}} param0
	 * @param {("file" | "directory")} param0.type
	 * @param {string} param0.parent
	 * @param {string} param0.uuid
	 * @param {*} param0.itemMetadata
	 * @returns {Promise<void>}
	 */
	private async checkIfItemParentIsShared({
		type,
		parent,
		uuid,
		itemMetadata
	}: {
		type: "file" | "directory"
		parent: string
		uuid: string
		itemMetadata: FileMetadata | FolderMetadata
	}): Promise<void> {
		const [isSharingParent, isLinkingParent] = await Promise.all([
			this.api.v3().dir().shared({ uuid: parent }),
			this.api.v3().dir().linked({ uuid: parent })
		])

		if (!isSharingParent.sharing && !isLinkingParent.link) {
			return
		}

		const promises: Promise<void>[] = []
		let tree: Record<string, CloudItemTree> | null = null

		if (isSharingParent.sharing) {
			const filesToShare: FileToShare[] = []
			const directoriesToShare: DirectoryToShare[] = []

			if (type === "file") {
				filesToShare.push({
					uuid,
					parent,
					metadata: itemMetadata as FileMetadata
				})
			} else {
				directoriesToShare.push({
					uuid,
					parent,
					metadata: itemMetadata as FolderMetadata
				})

				if (!tree) {
					tree = await this.getDirectoryTree({ uuid })
				}

				for (const entry in tree) {
					const item = tree[entry]

					if (item.uuid === uuid || item.parent === "base") {
						continue
					}

					if (item.type === "file") {
						filesToShare.push({
							uuid: item.uuid,
							parent: item.parent,
							metadata: {
								name: item.name,
								size: item.size,
								mime: item.mime,
								key: item.key,
								lastModified: item.lastModified,
								creation: item.creation,
								hash: item.hash
							} satisfies FileMetadata
						})
					} else {
						directoriesToShare.push({
							uuid: item.uuid,
							parent: item.parent,
							metadata: {
								name: item.name
							} satisfies FolderMetadata
						})
					}
				}
			}

			for (const file of filesToShare) {
				for (const user of isSharingParent.users) {
					promises.push(
						this.shareItem({
							uuid: file.uuid,
							parent: file.parent,
							email: user.email,
							publicKey: user.publicKey,
							metadata: file.metadata,
							type: "file"
						})
					)
				}
			}

			for (const directory of directoriesToShare) {
				for (const user of isSharingParent.users) {
					promises.push(
						this.shareItem({
							uuid: directory.uuid,
							parent: directory.parent,
							email: user.email,
							publicKey: user.publicKey,
							metadata: directory.metadata,
							type: "folder"
						})
					)
				}
			}
		}

		if (isLinkingParent.link) {
			const filesToLink: FileToShare[] = []
			const directoriesToLink: DirectoryToShare[] = []

			if (type === "file") {
				filesToLink.push({
					uuid,
					parent,
					metadata: itemMetadata as FileMetadata
				})
			} else {
				directoriesToLink.push({
					uuid,
					parent,
					metadata: itemMetadata as FolderMetadata
				})

				if (!tree) {
					tree = await this.getDirectoryTree({ uuid })
				}

				for (const entry in tree) {
					const item = tree[entry]

					if (item.uuid === uuid || item.parent === "base") {
						continue
					}

					if (item.type === "file") {
						filesToLink.push({
							uuid: item.uuid,
							parent: item.parent,
							metadata: {
								name: item.name,
								size: item.size,
								mime: item.mime,
								key: item.key,
								lastModified: item.lastModified,
								creation: item.creation,
								hash: item.hash
							} satisfies FileMetadata
						})
					} else {
						directoriesToLink.push({
							uuid: item.uuid,
							parent: item.parent,
							metadata: {
								name: item.name
							} satisfies FolderMetadata
						})
					}
				}
			}

			for (const file of filesToLink) {
				for (const link of isLinkingParent.links) {
					promises.push(
						this.addItemToDirectoryPublicLink({
							uuid: file.uuid,
							parent: file.parent,
							metadata: file.metadata,
							type: "file",
							linkUUID: link.linkUUID,
							linkKeyEncrypted: link.linkKey,
							expiration: "never"
						})
					)
				}
			}

			for (const directory of directoriesToLink) {
				for (const link of isLinkingParent.links) {
					promises.push(
						this.addItemToDirectoryPublicLink({
							uuid: directory.uuid,
							parent: directory.parent,
							metadata: directory.metadata,
							type: "folder",
							linkUUID: link.linkUUID,
							linkKeyEncrypted: link.linkKey,
							expiration: "never"
						})
					)
				}
			}
		}

		if (promises.length > 0) {
			await promiseAllChunked(promises)
		}
	}

	/**
	 * Rename a shared item.
	 * @date 2/17/2024 - 4:32:56 AM
	 *
	 * @private
	 * @async
	 * @param {({uuid: string, receiverId: number, metadata: FileMetadata | FolderMetadata, publicKey: string})} param0
	 * @param {string} param0.uuid
	 * @param {number} param0.receiverId
	 * @param {*} param0.metadata
	 * @param {string} param0.publicKey
	 * @returns {Promise<void>}
	 */
	private async renameSharedItem({
		uuid,
		receiverId,
		metadata,
		publicKey
	}: {
		uuid: string
		receiverId: number
		metadata: FileMetadata | FolderMetadata
		publicKey: string
	}): Promise<void> {
		const metadataEncrypted = await this.crypto.encrypt().metadataPublic({ metadata: JSON.stringify(metadata), publicKey })

		await this.api.v3().item().sharedRename({ uuid, receiverId, metadata: metadataEncrypted })
	}

	/**
	 * Rename a publicly linked item.
	 * @date 2/17/2024 - 4:35:07 AM
	 *
	 * @private
	 * @async
	 * @param {({uuid: string, linkUUID: string, metadata: FileMetadata | FolderMetadata, linkKeyEncrypted: string})} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.linkUUID
	 * @param {*} param0.metadata
	 * @param {string} param0.linkKeyEncrypted
	 * @returns {Promise<void>}
	 */
	private async renamePubliclyLinkedItem({
		uuid,
		linkUUID,
		metadata,
		linkKeyEncrypted
	}: {
		uuid: string
		linkUUID: string
		metadata: FileMetadata | FolderMetadata
		linkKeyEncrypted: string
	}): Promise<void> {
		const key = await this.crypto.decrypt().folderLinkKey({ metadata: linkKeyEncrypted })
		const metadataEncrypted = await this.crypto.encrypt().metadata({ metadata: JSON.stringify(metadata), key })

		await this.api.v3().item().linkedRename({ uuid, linkUUID, metadata: metadataEncrypted })
	}

	/**
	 * Checks if an item is shared or public linked.
	 * If so, it renames the item.
	 * @date 2/17/2024 - 4:37:30 AM
	 *
	 * @private
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		itemMetadata: FileMetadata | FolderMetadata
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {*} param0.itemMetadata
	 * @returns {Promise<void>}
	 */
	private async checkIfItemIsSharedForRename({
		uuid,
		itemMetadata
	}: {
		uuid: string
		itemMetadata: FileMetadata | FolderMetadata
	}): Promise<void> {
		const [isSharingItem, isLinkingItem] = await Promise.all([
			this.api.v3().item().shared({ uuid }),
			this.api.v3().item().linked({ uuid })
		])

		if (!isSharingItem.sharing && !isLinkingItem.link) {
			return
		}

		const promises: Promise<void>[] = []

		if (isSharingItem.sharing) {
			for (const user of isSharingItem.users) {
				promises.push(this.renameSharedItem({ uuid, receiverId: user.id, metadata: itemMetadata, publicKey: user.publicKey }))
			}
		}

		if (isLinkingItem.link) {
			for (const link of isLinkingItem.links) {
				promises.push(
					this.renamePubliclyLinkedItem({ uuid, linkUUID: link.linkUUID, metadata: itemMetadata, linkKeyEncrypted: link.linkKey })
				)
			}
		}

		if (promises.length > 0) {
			await promiseAllChunked(promises)
		}
	}

	/**
	 * Fetch directory size in bytes.
	 * @date 2/20/2024 - 9:21:16 PM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, sharerId?: number, receiverId?: number, trash?: boolean}} param0
	 * @param {string} param0.uuid
	 * @param {number} param0.sharerId
	 * @param {number} param0.receiverId
	 * @param {boolean} param0.trash
	 * @returns {Promise<number>}
	 */
	public async directorySize({
		uuid,
		sharerId,
		receiverId,
		trash
	}: {
		uuid: string
		sharerId?: number
		receiverId?: number
		trash?: boolean
	}): Promise<number> {
		return (await this.api.v3().dir().size({ uuid, sharerId, receiverId, trash })).size
	}

	/**
	 * Fetch size of a directory inside a public link in bytes.
	 * @date 2/20/2024 - 9:21:53 PM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, linkUUID: string}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.linkUUID
	 * @returns {Promise<number>}
	 */
	public async directorySizePublicLink({ uuid, linkUUID }: { uuid: string; linkUUID: string }): Promise<number> {
		return (await this.api.v3().dir().sizeLink({ uuid, linkUUID })).size
	}

	/**
	 * Download a file to a local path. Only works in a Node.JS environment.
	 * @date 2/15/2024 - 7:39:34 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		bucket: string
	 * 		region: string
	 * 		chunks: number
	 * 		version: FileEncryptionVersion
	 * 		key: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		chunksStart?: number
	 * 		chunksEnd?: number
	 * 		to?: string
	 * 		onProgress?: ProgressCallback
	 * 		onQueued?: () => void
	 * 		onStarted?: () => void
	 * 		onError?: (err: Error) => void
	 * 		onFinished?: () => void
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.bucket
	 * @param {string} param0.region
	 * @param {number} param0.chunks
	 * @param {FileEncryptionVersion} param0.version
	 * @param {string} param0.key
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {number} param0.chunksStart
	 * @param {number} param0.chunksEnd
	 * @param {string} param0.to
	 * @param {ProgressCallback} param0.onProgress
	 * @param {() => void} param0.onQueued
	 * @param {() => void} param0.onStarted
	 * @param {(err: Error) => void} param0.onError
	 * @param {() => void} param0.onFinished
	 * @returns {Promise<string>}
	 */
	public async downloadFileToLocal({
		uuid,
		bucket,
		region,
		chunks,
		version,
		key,
		abortSignal,
		pauseSignal,
		chunksStart,
		chunksEnd,
		to,
		onProgress,
		onQueued,
		onStarted,
		onError,
		onFinished
	}: {
		uuid: string
		bucket: string
		region: string
		chunks: number
		version: FileEncryptionVersion
		key: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		chunksStart?: number
		chunksEnd?: number
		to?: string
		onProgress?: ProgressCallback
		onQueued?: () => void
		onStarted?: () => void
		onError?: (err: Error) => void
		onFinished?: () => void
	}): Promise<string> {
		if (environment !== "node") {
			throw new Error(`cloud.downloadFileToLocal is not implemented for ${environment}`)
		}

		if (onQueued) {
			onQueued()
		}

		await this._semaphores.downloads.acquire()

		try {
			if (onStarted) {
				onStarted()
			}

			const lastChunk = chunksEnd ? (chunksEnd === Infinity ? chunks : chunksEnd) : chunks
			const firstChunk = chunksStart ? chunksStart : 0
			const tmpDir = this.sdkConfig.tmpPath ? this.sdkConfig.tmpPath : os.tmpdir()
			const destinationPath = normalizePath(to ? to : pathModule.join(tmpDir, "filen-sdk", await uuidv4()))
			const tmpChunksPath = normalizePath(pathModule.join(tmpDir, "filen-sdk", await uuidv4()))
			let currentWriteIndex = firstChunk
			let writerStopped = false

			await Promise.all([
				fs.rm(destinationPath, {
					force: true,
					maxRetries: 60 * 10,
					recursive: true,
					retryDelay: 100
				}),
				fs.rm(tmpChunksPath, {
					force: true,
					maxRetries: 60 * 10,
					recursive: true,
					retryDelay: 100
				})
			])

			await Promise.all([
				fs.mkdir(pathModule.dirname(destinationPath), {
					recursive: true
				}),
				fs.mkdir(tmpChunksPath, {
					recursive: true
				})
			])

			const waitForPause = async (): Promise<void> => {
				return await new Promise(resolve => {
					if (!pauseSignal || !pauseSignal.isPaused() || writerStopped || abortSignal?.aborted) {
						resolve()

						return
					}

					const wait = setInterval(() => {
						if (!pauseSignal.isPaused() || writerStopped || abortSignal?.aborted) {
							clearInterval(wait)

							resolve()
						}
					}, 10)
				})
			}

			const writeToDestination = async ({ index, file }: { index: number; file: string }) => {
				try {
					if (pauseSignal && pauseSignal.isPaused()) {
						await waitForPause()
					}

					if (abortSignal && abortSignal.aborted) {
						throw new Error("Aborted")
					}

					if (writerStopped) {
						return
					}

					if (index !== currentWriteIndex) {
						setTimeout(() => {
							writeToDestination({ index, file })
						}, 10)

						return
					}

					if (index === firstChunk) {
						await fs.move(file, destinationPath, {
							overwrite: true
						})
					} else {
						await appendStream({ inputFile: file, baseFile: destinationPath })
						await fs.rm(file, {
							force: true,
							maxRetries: 60 * 10,
							recursive: true,
							retryDelay: 100
						})
					}

					currentWriteIndex += 1
				} finally {
					this._semaphores.downloadWriters.release()
				}
			}

			try {
				await new Promise<void>((resolve, reject) => {
					let done = 0

					for (let i = firstChunk; i < lastChunk; i++) {
						const index = i

						;(async () => {
							try {
								await Promise.all([this._semaphores.downloadThreads.acquire(), this._semaphores.downloadWriters.acquire()])

								if (pauseSignal && pauseSignal.isPaused()) {
									await waitForPause()
								}

								if (abortSignal && abortSignal.aborted) {
									throw new Error("Aborted")
								}

								const encryptedTmpChunkPath = pathModule.join(tmpChunksPath, `${i}.encrypted`)

								await this.api
									.v3()
									.file()
									.download()
									.chunk()
									.local({ uuid, bucket, region, chunk: i, to: encryptedTmpChunkPath, abortSignal, onProgress })

								if (pauseSignal && pauseSignal.isPaused()) {
									await waitForPause()
								}

								if (abortSignal && abortSignal.aborted) {
									throw new Error("Aborted")
								}

								const decryptedTmpChunkPath = pathModule.join(tmpChunksPath, `${i}.decrypted`)

								await this.crypto
									.decrypt()
									.dataStream({ inputFile: encryptedTmpChunkPath, key, version, outputFile: decryptedTmpChunkPath })

								await fs.rm(encryptedTmpChunkPath, {
									force: true,
									maxRetries: 60 * 10,
									recursive: true,
									retryDelay: 100
								})

								writeToDestination({ index, file: decryptedTmpChunkPath }).catch(err => {
									this._semaphores.downloadThreads.release()
									this._semaphores.downloadWriters.release()

									writerStopped = true

									reject(err)
								})

								done += 1

								this._semaphores.downloadThreads.release()

								if (done >= lastChunk) {
									resolve()
								}
							} catch (e) {
								this._semaphores.downloadThreads.release()
								this._semaphores.downloadWriters.release()

								writerStopped = true

								throw e
							}
						})().catch(reject)
					}
				})

				await new Promise<void>(resolve => {
					if (currentWriteIndex >= lastChunk) {
						resolve()

						return
					}

					const wait = setInterval(() => {
						if (currentWriteIndex >= lastChunk) {
							clearInterval(wait)

							resolve()
						}
					}, 10)
				})
			} catch (e) {
				await fs.rm(destinationPath, {
					force: true,
					maxRetries: 60 * 10,
					recursive: true,
					retryDelay: 100
				})

				if (onError) {
					onError(e as unknown as Error)
				}

				throw e
			} finally {
				await fs.rm(tmpChunksPath, {
					force: true,
					maxRetries: 60 * 10,
					recursive: true,
					retryDelay: 100
				})
			}

			if (onFinished) {
				onFinished()
			}

			return destinationPath
		} finally {
			this._semaphores.downloads.release()
		}
	}

	/**
	 * Download a file to a ReadableStream.
	 * @date 2/15/2024 - 7:36:05 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		bucket: string
	 * 		region: string
	 * 		chunks: number
	 * 		version: FileEncryptionVersion
	 * 		key: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		chunksStart?: number
	 * 		chunksEnd?: number
	 * 		onProgress?: ProgressCallback
	 * 		onQueued?: () => void
	 * 		onStarted?: () => void
	 * 		onError?: (err: Error) => void
	 * 		onFinished?: () => void
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.bucket
	 * @param {string} param0.region
	 * @param {number} param0.chunks
	 * @param {FileEncryptionVersion} param0.version
	 * @param {string} param0.key
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {number} param0.chunksStart
	 * @param {number} param0.chunksEnd
	 * @param {ProgressCallback} param0.onProgress
	 * @param {() => void} param0.onQueued
	 * @param {() => void} param0.onStarted
	 * @param {(err: Error) => void} param0.onError
	 * @param {() => void} param0.onFinished
	 * @returns {Promise<ReadableStream>}
	 */
	public async downloadFileToReadableStream({
		uuid,
		bucket,
		region,
		chunks,
		version,
		key,
		abortSignal,
		pauseSignal,
		chunksStart,
		chunksEnd,
		onProgress,
		onQueued,
		onStarted,
		onError,
		onFinished
	}: {
		uuid: string
		bucket: string
		region: string
		chunks: number
		version: FileEncryptionVersion
		key: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		chunksStart?: number
		chunksEnd?: number
		onProgress?: ProgressCallback
		onQueued?: () => void
		onStarted?: () => void
		onError?: (err: Error) => void
		onFinished?: () => void
	}): Promise<ReadableStream> {
		if (onQueued) {
			onQueued()
		}

		await this._semaphores.downloads.acquire()

		if (onStarted) {
			onStarted()
		}

		const threadsSemaphore = this._semaphores.downloadThreads
		const writersSemaphore = this._semaphores.downloadWriters
		const downloadsSemaphore = this._semaphores.downloads
		const api = this.api
		const crypto = this.crypto
		const lastChunk = chunksEnd ? (chunksEnd === Infinity ? chunks : chunksEnd) : chunks
		const firstChunk = chunksStart ? chunksStart : 0
		let currentWriteIndex = firstChunk
		let writerStopped = false

		const waitForPause = async (): Promise<void> => {
			return await new Promise(resolve => {
				if (!pauseSignal || !pauseSignal.isPaused() || writerStopped || abortSignal?.aborted) {
					resolve()

					return
				}

				const wait = setInterval(() => {
					if (!pauseSignal.isPaused() || writerStopped || abortSignal?.aborted) {
						clearInterval(wait)

						resolve()
					}
				}, 10)
			})
		}

		return new ReadableStream(
			{
				async start(controller) {
					const write = async ({ index, buffer }: { index: number; buffer: Buffer }): Promise<void> => {
						try {
							if (pauseSignal && pauseSignal.isPaused()) {
								await waitForPause()
							}

							if (abortSignal && abortSignal.aborted) {
								throw new Error("Aborted")
							}

							if (writerStopped) {
								return
							}

							if (index !== currentWriteIndex) {
								setTimeout(() => {
									write({ index, buffer })
								}, 10)

								return
							}

							if (buffer.byteLength > 0) {
								controller.enqueue(buffer)
							}

							currentWriteIndex += 1
						} finally {
							writersSemaphore.release()
						}
					}

					try {
						await new Promise<void>((resolve, reject) => {
							let done = 0

							for (let i = firstChunk; i < lastChunk; i++) {
								const index = i

								;(async () => {
									try {
										await Promise.all([threadsSemaphore.acquire(), writersSemaphore.acquire()])

										if (pauseSignal && pauseSignal.isPaused()) {
											await waitForPause()
										}

										if (abortSignal && abortSignal.aborted) {
											controller.close()

											reject(new Error("Aborted"))

											return
										}

										const encryptedBuffer = await api
											.v3()
											.file()
											.download()
											.chunk()
											.buffer({ uuid, bucket, region, chunk: i, abortSignal, onProgress })

										if (pauseSignal && pauseSignal.isPaused()) {
											await waitForPause()
										}

										if (abortSignal && abortSignal.aborted) {
											controller.close()

											reject(new Error("Aborted"))

											return
										}

										if (pauseSignal && pauseSignal.isPaused()) {
											await waitForPause()
										}

										const decryptedBuffer = await crypto.decrypt().data({ data: encryptedBuffer, key, version })

										write({ index, buffer: decryptedBuffer }).catch(err => {
											threadsSemaphore.release()
											writersSemaphore.release()

											controller.close()

											writerStopped = true

											reject(err)
										})

										done += 1

										threadsSemaphore.release()

										if (done >= lastChunk) {
											resolve()
										}
									} catch (e) {
										threadsSemaphore.release()
										writersSemaphore.release()

										controller.close()

										writerStopped = true

										throw e
									}
								})().catch(reject)
							}
						})

						await new Promise<void>(resolve => {
							if (currentWriteIndex >= lastChunk) {
								resolve()

								return
							}

							const wait = setInterval(() => {
								if (currentWriteIndex >= lastChunk) {
									clearInterval(wait)

									resolve()
								}
							}, 10)
						})
					} catch (e) {
						if (onError) {
							onError(e as unknown as Error)
						}

						throw e
					} finally {
						controller.close()
						downloadsSemaphore.release()
					}

					if (onFinished) {
						onFinished()
					}
				}
			},
			{
				highWaterMark: 1024 * 1024
			}
		)
	}

	/**
	 * Build a recursive directory tree which includes sub-directories and sub-files.
	 * @date 2/22/2024 - 1:45:28 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		type?: DirDownloadType
	 * 		linkUUID?: string
	 * 		linkHasPassword?: boolean
	 * 		linkPassword?: string
	 * 		linkSalt?: string
	 * 		skipCache?: boolean
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {DirDownloadType} [param0.type="normal"]
	 * @param {string} param0.linkUUID
	 * @param {boolean} param0.linkHasPassword
	 * @param {string} param0.linkPassword
	 * @param {string} param0.linkSalt
	 * @param {boolean} param0.skipCache
	 * @returns {Promise<Record<string, CloudItemTree>>}
	 */
	public async getDirectoryTree({
		uuid,
		type = "normal",
		linkUUID,
		linkHasPassword,
		linkPassword,
		linkSalt,
		skipCache
	}: {
		uuid: string
		type?: DirDownloadType
		linkUUID?: string
		linkHasPassword?: boolean
		linkPassword?: string
		linkSalt?: string
		skipCache?: boolean
	}): Promise<Record<string, CloudItemTree>> {
		const contents = await this.api.v3().dir().download({ uuid, type, linkUUID, linkHasPassword, linkPassword, linkSalt, skipCache })
		const tree: Record<string, CloudItemTree> = {}
		const folderNames: Record<string, string> = { base: "/" }

		for (const folder of contents.folders) {
			const decrypted =
				folder.parent !== "base" ? await this.crypto.decrypt().folderMetadata({ metadata: folder.name }) : { name: "" }
			const parentPath = folder.parent === "base" ? "" : `${folderNames[folder.parent]}/`
			const folderPath = `${parentPath}${decrypted.name}`

			folderNames[folder.uuid] = folderPath
			tree[folderPath] = {
				type: "directory",
				uuid: folder.uuid,
				name: decrypted.name,
				parent: folder.parent,
				size: 0
			}
		}

		const promises: Promise<void>[] = []

		for (const file of contents.files) {
			promises.push(
				new Promise((resolve, reject) => {
					this.crypto
						.decrypt()
						.fileMetadata({ metadata: file.metadata })
						.then(decrypted => {
							if (decrypted.name.length === 0) {
								resolve()

								if (file.metadata.startsWith("U")) {
									console.log(file.uuid, "empty name", file.metadata.slice(0, 10))
								}

								return
							}

							const parentPath = folderNames[file.parent]

							tree[`${parentPath}/${decrypted.name}`] = {
								type: "file",
								uuid: file.uuid,
								name: decrypted.name,
								size: decrypted.size,
								mime: decrypted.mime,
								lastModified: convertTimestampToMs(decrypted.lastModified),
								parent: file.parent,
								version: file.version,
								chunks: file.chunks,
								key: decrypted.key,
								bucket: file.bucket,
								region: file.region,
								creation: decrypted.creation,
								hash: decrypted.hash
							}

							resolve()
						})
						.catch(reject)
				})
			)
		}

		await promiseAllChunked(promises)

		return tree
	}

	/**
	 * Download a directory to path. Only available in a Node.JS environment.
	 * @date 2/16/2024 - 1:30:09 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		type?: DirDownloadType
	 * 		linkUUID?: string
	 * 		linkHasPassword?: boolean
	 * 		linkPassword?: string
	 * 		linkSalt?: string
	 * 		to?: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 		onQueued?: () => void
	 * 		onStarted?: () => void
	 * 		onError?: (err: Error) => void
	 * 		onFinished?: () => void
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {DirDownloadType} [param0.type="normal"]
	 * @param {string} param0.linkUUID
	 * @param {boolean} param0.linkHasPassword
	 * @param {string} param0.linkPassword
	 * @param {string} param0.linkSalt
	 * @param {string} param0.to
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {() => void} param0.onQueued
	 * @param {() => void} param0.onStarted
	 * @param {(err: Error) => void} param0.onError
	 * @param {() => void} param0.onFinished
	 * @returns {Promise<string>}
	 */
	public async downloadDirectoryToLocal({
		uuid,
		type = "normal",
		linkUUID,
		linkHasPassword,
		linkPassword,
		linkSalt,
		to,
		abortSignal,
		pauseSignal,
		onQueued,
		onStarted,
		onError,
		onFinished,
		onProgress
	}: {
		uuid: string
		type?: DirDownloadType
		linkUUID?: string
		linkHasPassword?: boolean
		linkPassword?: string
		linkSalt?: string
		to?: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onQueued?: () => void
		onStarted?: () => void
		onError?: (err: Error) => void
		onFinished?: () => void
	}): Promise<string> {
		if (environment !== "node") {
			throw new Error(`cloud.downloadDirectoryToLocal is not implemented for ${environment}`)
		}

		if (onQueued) {
			onQueued()
		}

		await this._semaphores.directoryDownloads.acquire()

		let destinationPath: string | null = null

		try {
			if (onStarted) {
				onStarted()
			}

			const tmpDir = this.sdkConfig.tmpPath ? this.sdkConfig.tmpPath : os.tmpdir()

			destinationPath = normalizePath(to ? to : pathModule.join(tmpDir, "filen-sdk", await uuidv4()))

			await fs.rm(destinationPath, {
				force: true,
				maxRetries: 60 * 10,
				recursive: true,
				retryDelay: 100
			})

			await fs.mkdir(destinationPath, {
				recursive: true
			})

			const tree = await this.getDirectoryTree({ uuid, type, linkUUID, linkHasPassword, linkPassword, linkSalt })
			const promises: Promise<void>[] = []

			for (const path in tree) {
				const item = tree[path]

				if (item.type !== "file") {
					continue
				}

				const filePath = pathModule.join(destinationPath, path)

				promises.push(
					new Promise((resolve, reject) => {
						this.downloadFileToLocal({
							uuid: item.uuid,
							bucket: item.bucket,
							region: item.region,
							chunks: item.chunks,
							version: item.version,
							key: item.key,
							abortSignal,
							pauseSignal,
							to: filePath,
							onProgress
						})
							.then(() => resolve())
							.catch(reject)
					})
				)
			}

			await promiseAllChunked(promises)

			if (onFinished) {
				onFinished()
			}

			return destinationPath
		} catch (e) {
			if (destinationPath) {
				await fs.rm(destinationPath, {
					force: true,
					maxRetries: 60 * 10,
					recursive: true,
					retryDelay: 100
				})
			}

			if (onError) {
				onError(e as unknown as Error)
			}

			throw e
		} finally {
			this._semaphores.directoryDownloads.release()
		}
	}

	/**
	 * Upload a local file. Only available in a Node.JS environment.
	 * @date 2/16/2024 - 5:13:26 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		source: string
	 * 		parent: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 		onQueued?: () => void
	 * 		onStarted?: () => void
	 * 		onError?: (err: Error) => void
	 * 		onFinished?: () => void
	 * 		onUploaded?: (item: CloudItem) => Promise<void>
	 * 	}} param0
	 * @param {string} param0.source
	 * @param {string} param0.parent
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {AbortSignal} param0.abortSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @param {() => void} param0.onQueued
	 * @param {() => void} param0.onStarted
	 * @param {(err: Error) => void} param0.onError
	 * @param {() => void} param0.onFinished
	 * @param {(item: CloudItem) => Promise<void>} param0.onUploaded
	 * @returns {Promise<CloudItem>}
	 */
	public async uploadLocalFile({
		source,
		parent,
		pauseSignal,
		abortSignal,
		onProgress,
		onQueued,
		onStarted,
		onError,
		onFinished,
		onUploaded
	}: {
		source: string
		parent: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onQueued?: () => void
		onStarted?: () => void
		onError?: (err: Error) => void
		onFinished?: () => void
		onUploaded?: (item: CloudItem) => Promise<void>
	}): Promise<CloudItem> {
		if (environment !== "node") {
			throw new Error(`cloud.uploadFileFromLocal is not implemented for ${environment}`)
		}

		if (onQueued) {
			onQueued()
		}

		await this._semaphores.uploads.acquire()

		try {
			if (onStarted) {
				onStarted()
			}

			source = normalizePath(source)

			if (!(await fs.exists(source))) {
				throw new Error(`Could not find source file at path ${source}.`)
			}

			const parentPresent = await this.api.v3().dir().present({ uuid: parent })

			if (!parentPresent.present || parentPresent.trash) {
				throw new Error(`Can not upload file to parent directory ${parent}. Parent is either not present or in the trash.`)
			}

			const fileName = pathModule.basename(source)

			if (fileName === "." || fileName === "/" || fileName.length <= 0) {
				throw new Error(`Invalid source file at path ${source}. Could not parse file name.`)
			}

			const mimeType = mimeTypes.lookup(fileName) || "application/octet-stream"
			const fileStats = await fs.stat(source)

			if (
				!fileStats.isFile() ||
				fileStats.isDirectory() ||
				fileStats.isSymbolicLink() ||
				fileStats.isSocket() ||
				fileStats.isBlockDevice() ||
				fileStats.isCharacterDevice()
			) {
				throw new Error(`Invalid source file at path ${source}. Not a file.`)
			}

			if (fileStats.size <= 0) {
				throw new Error(`Invalid source file at path ${source}. 0 bytes.`)
			}

			const fileSize = fileStats.size
			let dummyOffset = 0
			let fileChunks = 0
			const lastModified = parseInt(fileStats.mtimeMs.toString())
			const creation = parseInt(fileStats.birthtimeMs.toString())
			let bucket = DEFAULT_UPLOAD_BUCKET
			let region = DEFAULT_UPLOAD_REGION

			while (dummyOffset < fileSize) {
				fileChunks += 1
				dummyOffset += UPLOAD_CHUNK_SIZE
			}

			const [uuid, key, rm, uploadKey] = await Promise.all([
				uuidv4(),
				this.crypto.utils.generateRandomString({ length: 32 }),
				this.crypto.utils.generateRandomString({ length: 32 }),
				this.crypto.utils.generateRandomString({ length: 32 })
			])

			const [nameEncrypted, mimeEncrypted, sizeEncrypted, metadata, nameHashed] = await Promise.all([
				this.crypto.encrypt().metadata({ metadata: fileName, key }),
				this.crypto.encrypt().metadata({ metadata: mimeType, key }),
				this.crypto.encrypt().metadata({ metadata: fileSize.toString(), key }),
				this.crypto.encrypt().metadata({
					metadata: JSON.stringify({
						name: fileName,
						size: fileSize,
						mime: mimeType,
						key,
						lastModified,
						creation
					})
				}),
				this.crypto.utils.hashFn({ input: fileName.toLowerCase() })
			])

			const waitForPause = async (): Promise<void> => {
				return await new Promise(resolve => {
					if (!pauseSignal || !pauseSignal.isPaused() || abortSignal?.aborted) {
						resolve()

						return
					}

					const wait = setInterval(() => {
						if (!pauseSignal.isPaused() || abortSignal?.aborted) {
							clearInterval(wait)

							resolve()
						}
					}, 10)
				})
			}

			await new Promise<void>((resolve, reject) => {
				let done = 0

				for (let i = 0; i < fileChunks; i++) {
					const index = i

					;(async () => {
						try {
							await this._semaphores.uploadThreads.acquire()

							if (pauseSignal && pauseSignal.isPaused()) {
								await waitForPause()
							}

							if (abortSignal && abortSignal.aborted) {
								reject(new Error("Aborted"))

								return
							}

							const chunkBuffer = await utils.readLocalFileChunk({
								path: source,
								offset: index * UPLOAD_CHUNK_SIZE,
								length: UPLOAD_CHUNK_SIZE
							})

							if (pauseSignal && pauseSignal.isPaused()) {
								await waitForPause()
							}

							if (abortSignal && abortSignal.aborted) {
								reject(new Error("Aborted"))

								return
							}

							const encryptedChunkBuffer = await this.crypto.encrypt().data({ data: chunkBuffer, key })

							if (pauseSignal && pauseSignal.isPaused()) {
								await waitForPause()
							}

							if (abortSignal && abortSignal.aborted) {
								reject(new Error("Aborted"))

								return
							}

							const uploadResponse = await this.api
								.v3()
								.file()
								.upload()
								.chunk()
								.buffer({ uuid, index, parent, uploadKey, abortSignal, buffer: encryptedChunkBuffer, onProgress })

							bucket = uploadResponse.bucket
							region = uploadResponse.region

							done += 1

							this._semaphores.uploadThreads.release()

							if (done >= fileChunks) {
								resolve()
							}
						} catch (e) {
							this._semaphores.uploadThreads.release()

							throw e
						}
					})().catch(reject)
				}
			})

			const done = await this.api.v3().upload().done({
				uuid,
				name: nameEncrypted,
				nameHashed,
				size: sizeEncrypted,
				chunks: fileChunks,
				mime: mimeEncrypted,
				rm,
				metadata,
				version: CURRENT_FILE_ENCRYPTION_VERSION,
				uploadKey
			})

			fileChunks = done.chunks

			const item: CloudItem = {
				type: "file",
				uuid,
				name: fileName,
				size: fileSize,
				mime: mimeType,
				lastModified,
				timestamp: Date.now(),
				parent,
				rm,
				version: CURRENT_FILE_ENCRYPTION_VERSION,
				chunks: fileChunks,
				favorited: false,
				key: key,
				bucket,
				region,
				creation
			}

			await this.checkIfItemParentIsShared({
				type: "file",
				parent,
				uuid,
				itemMetadata: {
					name: fileName,
					size: fileSize,
					mime: mimeType,
					lastModified,
					creation,
					key
				}
			})

			if (onUploaded) {
				await onUploaded.call(undefined, item)
			}

			if (onFinished) {
				onFinished()
			}

			return item
		} catch (e) {
			if (onError) {
				onError(e as unknown as Error)
			}

			throw e
		} finally {
			this._semaphores.uploads.release()
		}
	}

	/**
	 * Upload a web-based file, such as from an <input /> field. Only works in a browser environment.
	 * @date 2/16/2024 - 5:50:00 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		file: File
	 * 		parent: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 		onQueued?: () => void
	 * 		onStarted?: () => void
	 * 		onError?: (err: Error) => void
	 * 		onFinished?: () => void
	 * 		onUploaded?: (item: CloudItem) => Promise<void>
	 * 	}} param0
	 * @param {File} param0.file
	 * @param {string} param0.parent
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {AbortSignal} param0.abortSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @param {() => void} param0.onQueued
	 * @param {() => void} param0.onStarted
	 * @param {(err: Error) => void} param0.onError
	 * @param {() => void} param0.onFinished
	 * @param {(item: CloudItem) => Promise<void>} param0.onUploaded
	 * @returns {Promise<CloudItem>}
	 */
	public async uploadWebFile({
		file,
		parent,
		pauseSignal,
		abortSignal,
		onProgress,
		onQueued,
		onStarted,
		onError,
		onFinished,
		onUploaded
	}: {
		file: File
		parent: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onQueued?: () => void
		onStarted?: () => void
		onError?: (err: Error) => void
		onFinished?: () => void
		onUploaded?: (item: CloudItem) => Promise<void>
	}): Promise<CloudItem> {
		if (environment !== "browser") {
			throw new Error(`cloud.uploadWebFile is not implemented for ${environment}`)
		}

		if (onQueued) {
			onQueued()
		}

		await this._semaphores.uploads.acquire()

		try {
			if (onStarted) {
				onStarted()
			}

			const parentPresent = await this.api.v3().dir().present({ uuid: parent })

			if (!parentPresent.present || parentPresent.trash) {
				throw new Error(`Can not upload file to parent directory ${parent}. Parent is either not present or in the trash.`)
			}

			const fileName = file.name
			const mimeType = mimeTypes.lookup(fileName) || "application/octet-stream"
			const fileSize = file.size
			let dummyOffset = 0
			let fileChunks = 0
			const lastModified = file.lastModified
			let bucket = DEFAULT_UPLOAD_BUCKET
			let region = DEFAULT_UPLOAD_REGION

			while (dummyOffset < fileSize) {
				fileChunks += 1
				dummyOffset += UPLOAD_CHUNK_SIZE
			}

			const [uuid, key, rm, uploadKey] = await Promise.all([
				uuidv4(),
				this.crypto.utils.generateRandomString({ length: 32 }),
				this.crypto.utils.generateRandomString({ length: 32 }),
				this.crypto.utils.generateRandomString({ length: 32 })
			])

			const [nameEncrypted, mimeEncrypted, sizeEncrypted, metadata, nameHashed] = await Promise.all([
				this.crypto.encrypt().metadata({ metadata: fileName, key }),
				this.crypto.encrypt().metadata({ metadata: mimeType, key }),
				this.crypto.encrypt().metadata({ metadata: fileSize.toString(), key }),
				this.crypto.encrypt().metadata({
					metadata: JSON.stringify({
						name: fileName,
						size: fileSize,
						mime: mimeType,
						key,
						lastModified
					})
				}),
				this.crypto.utils.hashFn({ input: fileName.toLowerCase() })
			])

			const waitForPause = async (): Promise<void> => {
				return await new Promise(resolve => {
					if (!pauseSignal || !pauseSignal.isPaused() || abortSignal?.aborted) {
						resolve()

						return
					}

					const wait = setInterval(() => {
						if (!pauseSignal.isPaused() || abortSignal?.aborted) {
							clearInterval(wait)

							resolve()
						}
					}, 10)
				})
			}

			await new Promise<void>((resolve, reject) => {
				let done = 0

				for (let i = 0; i < fileChunks; i++) {
					const index = i

					;(async () => {
						try {
							await this._semaphores.uploadThreads.acquire()

							if (pauseSignal && pauseSignal.isPaused()) {
								await waitForPause()
							}

							if (abortSignal && abortSignal.aborted) {
								reject(new Error("Aborted"))

								return
							}

							const chunkBuffer = await utils.readWebFileChunk({
								file,
								index,
								length: UPLOAD_CHUNK_SIZE
							})

							if (pauseSignal && pauseSignal.isPaused()) {
								await waitForPause()
							}

							if (abortSignal && abortSignal.aborted) {
								reject(new Error("Aborted"))

								return
							}

							const encryptedChunkBuffer = await this.crypto.encrypt().data({ data: chunkBuffer, key })

							if (pauseSignal && pauseSignal.isPaused()) {
								await waitForPause()
							}

							if (abortSignal && abortSignal.aborted) {
								reject(new Error("Aborted"))

								return
							}

							const uploadResponse = await this.api
								.v3()
								.file()
								.upload()
								.chunk()
								.buffer({ uuid, index, parent, uploadKey, abortSignal, buffer: encryptedChunkBuffer, onProgress })

							bucket = uploadResponse.bucket
							region = uploadResponse.region

							done += 1

							this._semaphores.uploadThreads.release()

							if (done >= fileChunks) {
								resolve()
							}
						} catch (e) {
							this._semaphores.uploadThreads.release()

							throw e
						}
					})().catch(reject)
				}
			})

			const done = await this.api.v3().upload().done({
				uuid,
				name: nameEncrypted,
				nameHashed,
				size: sizeEncrypted,
				chunks: fileChunks,
				mime: mimeEncrypted,
				rm,
				metadata,
				version: CURRENT_FILE_ENCRYPTION_VERSION,
				uploadKey
			})

			fileChunks = done.chunks

			const item: CloudItem = {
				type: "file",
				uuid,
				name: fileName,
				size: fileSize,
				mime: mimeType,
				lastModified,
				timestamp: Date.now(),
				parent,
				rm,
				version: CURRENT_FILE_ENCRYPTION_VERSION,
				chunks: fileChunks,
				favorited: false,
				key: key,
				bucket,
				region
			}

			await this.checkIfItemParentIsShared({
				type: "file",
				parent,
				uuid,
				itemMetadata: {
					name: fileName,
					size: fileSize,
					mime: mimeType,
					lastModified,
					key
				}
			})

			if (onUploaded) {
				await onUploaded.call(undefined, item)
			}

			if (onFinished) {
				onFinished()
			}

			return item
		} catch (e) {
			if (onError) {
				onError(e as unknown as Error)
			}

			throw e
		} finally {
			this._semaphores.uploads.release()
		}
	}

	/**
	 * Upload a local directory. Only available in a Node.JS environment.
	 * @date 2/17/2024 - 12:06:04 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		source: string
	 * 		parent: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 		onQueued?: () => void
	 * 		onStarted?: () => void
	 * 		onError?: (err: Error) => void
	 * 		onFinished?: () => void
	 * 		onUploaded?: (item: CloudItem) => Promise<void>
	 * 	}} param0
	 * @param {string} param0.source
	 * @param {string} param0.parent
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {AbortSignal} param0.abortSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @param {() => void} param0.onQueued
	 * @param {() => void} param0.onStarted
	 * @param {(err: Error) => void} param0.onError
	 * @param {() => void} param0.onFinished
	 * @param {(item: CloudItem) => Promise<void>} param0.onUploaded
	 * @returns {Promise<void>}
	 */
	public async uploadLocalDirectory({
		source,
		parent,
		pauseSignal,
		abortSignal,
		onProgress,
		onQueued,
		onStarted,
		onError,
		onFinished,
		onUploaded
	}: {
		source: string
		parent: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onQueued?: () => void
		onStarted?: () => void
		onError?: (err: Error) => void
		onFinished?: () => void
		onUploaded?: (item: CloudItem) => Promise<void>
	}): Promise<void> {
		if (environment !== "node") {
			throw new Error(`cloud.uploadDirectoryFromLocal is not implemented for ${environment}`)
		}

		if (onQueued) {
			onQueued()
		}

		await this._semaphores.directoryUploads.acquire()

		try {
			if (onStarted) {
				onStarted()
			}

			source = normalizePath(source)

			if (!(await fs.exists(source))) {
				throw new Error(`Could not find source directory at path ${source}.`)
			}

			const parentPresent = await this.api.v3().dir().present({ uuid: parent })

			if (!parentPresent.present || parentPresent.trash) {
				throw new Error(`Can not upload directory to parent directory ${parent}. Parent is either not present or in the trash.`)
			}

			const baseDirectoryName = pathModule.basename(source)

			if (baseDirectoryName === "." || baseDirectoryName === "/" || baseDirectoryName.length <= 0) {
				throw new Error(`Invalid source directory at path ${source}. Could not parse directory name.`)
			}

			parent = await this.createDirectory({ name: baseDirectoryName, parent })

			const content =
				pathModule.sep === "\\"
					? (
							(await fs.readdir(source, {
								recursive: true
							})) as string[]
					  ).map(entry => entry.split("\\").join("/"))
					: ((await fs.readdir(source, {
							recursive: true
					  })) as string[])

			const sortedBySeparatorLength = content.sort((a, b) => a.split("/").length - b.split("/").length)
			const statPromises: Promise<void>[] = []
			const entryStats: Record<string, fs.Stats> = {}
			const pathsToUUIDs: Record<string, string> = {}

			for (const entry of content) {
				statPromises.push(
					new Promise((resolve, reject) => {
						fs.stat(pathModule.join(source, entry))
							.then(stats => {
								entryStats[entry] = stats

								resolve()
							})
							.catch(reject)
					})
				)
			}

			await promiseAllChunked(statPromises)

			for (const entry of sortedBySeparatorLength) {
				const stats = entryStats[entry]

				if (
					!stats ||
					!stats.isDirectory() ||
					stats.isSymbolicLink() ||
					stats.isBlockDevice() ||
					stats.isCharacterDevice() ||
					stats.isSocket()
				) {
					continue
				}

				const parentPath = pathModule.posix.dirname(entry)
				const directoryParent = parentPath === "." || parentPath.length <= 0 ? parent : pathsToUUIDs[parentPath] ?? ""

				if (directoryParent.length <= 16) {
					continue
				}

				const directoryName = pathModule.posix.basename(entry)

				if (directoryName.length <= 0) {
					continue
				}

				const uuid = await this.createDirectory({ name: directoryName, parent: directoryParent })

				pathsToUUIDs[entry] = uuid
			}

			const uploadPromises: Promise<CloudItem>[] = []

			for (const entry of sortedBySeparatorLength) {
				const stats = entryStats[entry]

				if (
					!stats ||
					!stats.isFile() ||
					stats.size <= 0 ||
					stats.isSymbolicLink() ||
					stats.isBlockDevice() ||
					stats.isCharacterDevice() ||
					stats.isSocket()
				) {
					continue
				}

				const parentPath = pathModule.posix.dirname(entry)
				const fileParent = parentPath === "." || parentPath.length <= 0 ? parent : pathsToUUIDs[parentPath] ?? ""

				if (fileParent.length <= 16) {
					continue
				}

				uploadPromises.push(
					this.uploadLocalFile({
						source: pathModule.join(source, entry),
						parent: fileParent,
						abortSignal,
						pauseSignal,
						onProgress,
						onUploaded
					})
				)
			}

			await promiseAllChunked(uploadPromises)

			if (onFinished) {
				onFinished()
			}
		} catch (e) {
			if (onError) {
				onError(e as unknown as Error)
			}

			throw e
		} finally {
			this._semaphores.directoryUploads.release()
		}
	}

	/**
	 * Upload a web-based directory, such as from an <input /> field. Only works in a browser environment.
	 * @date 2/19/2024 - 6:08:36 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		files: FileList
	 * 		parent: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 		onQueued?: () => void
	 * 		onStarted?: () => void
	 * 		onError?: (err: Error) => void
	 * 		onFinished?: () => void
	 * 		onUploaded?: (item: CloudItem) => Promise<void>
	 * 	}} param0
	 * @param {FileList} param0.files
	 * @param {string} param0.parent
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {AbortSignal} param0.abortSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @param {() => void} param0.onQueued
	 * @param {() => void} param0.onStarted
	 * @param {(err: Error) => void} param0.onError
	 * @param {() => void} param0.onFinished
	 * @param {(item: CloudItem) => Promise<void>} param0.onUploaded
	 * @returns {Promise<void>}
	 */
	public async uploadDirectoryFromWeb({
		files,
		parent,
		pauseSignal,
		abortSignal,
		onProgress,
		onQueued,
		onStarted,
		onError,
		onFinished,
		onUploaded
	}: {
		files: FileList
		parent: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onQueued?: () => void
		onStarted?: () => void
		onError?: (err: Error) => void
		onFinished?: () => void
		onUploaded?: (item: CloudItem) => Promise<void>
	}): Promise<void> {
		if (environment !== "browser") {
			throw new Error(`cloud.uploadDirectoryFromWeb is not implemented for ${environment}`)
		}

		if (onQueued) {
			onQueued()
		}

		await this._semaphores.directoryUploads.acquire()

		try {
			if (onStarted) {
				onStarted()
			}

			const filesToUpload: { path: string; file: File }[] = []
			let baseDirectoryName: string | null = null
			const pathsToUUIDs: Record<string, string> = {}

			for (let i = 0; i < files.length; i++) {
				const file = files[i]

				if (
					typeof file.webkitRelativePath !== "string" ||
					file.webkitRelativePath.length <= 0 ||
					file.size <= 0 ||
					!file.webkitRelativePath.includes("/")
				) {
					continue
				}

				const ex = file.webkitRelativePath.split("/")

				filesToUpload.push({
					path: ex.slice(1).join("/"),
					file
				})

				if (ex[0] && ex[0].length > 0) {
					baseDirectoryName = ex[0].trim()
				}
			}

			if (!baseDirectoryName) {
				throw new Error(`Can not upload directory to parent directory ${parent}. Could not parse base directory name.`)
			}

			const parentPresent = await this.api.v3().dir().present({ uuid: parent })

			if (!parentPresent.present || parentPresent.trash) {
				throw new Error(`Can not upload directory to parent directory ${parent}. Parent is either not present or in the trash.`)
			}

			parent = await this.createDirectory({ name: baseDirectoryName, parent })

			pathsToUUIDs[baseDirectoryName] = parent

			const directoryPaths = filesToUpload.map(file => pathModule.posix.dirname(file.path))

			for (const path of directoryPaths) {
				const possiblePaths = getEveryPossibleDirectoryPath(path)

				for (const possiblePath of possiblePaths) {
					if (!directoryPaths.includes(possiblePath)) {
						directoryPaths.push(possiblePath)
					}
				}
			}

			for (const path of directoryPaths) {
				const parentPath = pathModule.posix.dirname(path)
				const directoryParent = parentPath === "." || parentPath.length <= 0 ? parent : pathsToUUIDs[parentPath] ?? ""

				if (directoryParent.length <= 16) {
					continue
				}

				const directoryName = pathModule.posix.basename(path)

				if (directoryName.length <= 0) {
					continue
				}

				const uuid = await this.createDirectory({ name: directoryName, parent: directoryParent })

				pathsToUUIDs[path] = uuid
			}

			const uploadPromises: Promise<CloudItem>[] = []

			for (const entry of filesToUpload) {
				const parentPath = pathModule.posix.dirname(entry.path)
				const fileParent = parentPath === "." || parentPath.length <= 0 ? parent : pathsToUUIDs[parentPath] ?? ""

				if (fileParent.length <= 16) {
					continue
				}

				uploadPromises.push(
					this.uploadWebFile({
						file: entry.file,
						parent: fileParent,
						abortSignal,
						pauseSignal,
						onProgress,
						onUploaded
					})
				)
			}

			await promiseAllChunked(uploadPromises)

			if (onFinished) {
				onFinished()
			}
		} catch (e) {
			if (onError) {
				onError(e as unknown as Error)
			}

			throw e
		} finally {
			this._semaphores.directoryUploads.release()
		}
	}
}

export default Cloud
