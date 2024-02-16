import type API from "../api"
import type Crypto from "../crypto"
import type { FilenSDKConfig } from ".."
import type DirColor from "../api/v3/dir/color"
import type { FileEncryptionVersion, FileMetadata, ProgressCallback } from "../types"
import { convertTimestampToMs, promiseAllChunked, uuidv4, normalizePath } from "../utils"
import {
	environment,
	MAX_DOWNLOAD_THREADS,
	MAX_DOWNLOAD_WRITERS,
	MAX_UPLOAD_THREADS,
	CURRENT_FILE_ENCRYPTION_VERSION,
	DEFAULT_UPLOAD_BUCKET,
	DEFAULT_UPLOAD_REGION,
	UPLOAD_CHUNK_SIZE
} from "../constants"
import { PauseSignal } from "./signals"
import pathModule from "path"
import os from "os"
import fs from "fs-extra"
import { Semaphore } from "../semaphore"
import appendStream from "../streams/append"
import type { DirColors } from "../api/v3/dir/color"
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

export type CloudItemSharedBase = {
	sharerEmail: string
	sharerId: number
	receiverEmail: string
	receiverId: number
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
		uploadThreads: new Semaphore(MAX_UPLOAD_THREADS)
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
				new Promise((resolve, reject) =>
					this.crypto
						.decrypt()
						.folderMetadata({ metadata: folder.name })
						.then(decrypted => {
							const timestamp = convertTimestampToMs(folder.timestamp)

							items.push({
								type: "directory",
								uuid: folder.uuid,
								name: decrypted.name,
								lastModified: timestamp,
								timestamp,
								color: folder.color,
								parent: folder.parent,
								favorited: folder.favorited === 1
							})

							resolve()
						})
						.catch(reject)
				)
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise((resolve, reject) =>
					this.crypto
						.decrypt()
						.fileMetadata({ metadata: file.metadata })
						.then(decrypted => {
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
				)
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
				new Promise((resolve, reject) =>
					this.crypto
						.decrypt()
						.folderMetadataPrivate({ metadata: folder.metadata })
						.then(decrypted => {
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
								receiverId: folder.receiverId ?? 0
							})

							resolve()
						})
						.catch(reject)
				)
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise((resolve, reject) =>
					this.crypto
						.decrypt()
						.fileMetadataPrivate({ metadata: file.metadata })
						.then(decrypted => {
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
								receiverId: file.receiverId ?? 0
							})

							resolve()
						})
						.catch(reject)
				)
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
				new Promise((resolve, reject) =>
					this.crypto
						.decrypt()
						.folderMetadata({ metadata: folder.metadata })
						.then(decrypted => {
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
								receiverId: folder.receiverId ?? 0
							})

							resolve()
						})
						.catch(reject)
				)
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise((resolve, reject) =>
					this.crypto
						.decrypt()
						.fileMetadata({ metadata: file.metadata })
						.then(decrypted => {
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
								receiverId: file.receiverId ?? 0
							})

							resolve()
						})
						.catch(reject)
				)
			)
		}

		await promiseAllChunked(promises)

		return items
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
				new Promise((resolve, reject) =>
					this.crypto
						.decrypt()
						.fileMetadata({ metadata: file.metadata })
						.then(decrypted => {
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
				)
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
				new Promise((resolve, reject) =>
					this.crypto
						.decrypt()
						.folderMetadata({ metadata: folder.name })
						.then(decrypted => {
							const timestamp = convertTimestampToMs(folder.timestamp)

							items.push({
								type: "directory",
								uuid: folder.uuid,
								name: decrypted.name,
								lastModified: timestamp,
								timestamp,
								color: folder.color,
								parent: folder.parent,
								favorited: folder.favorited === 1
							})

							resolve()
						})
						.catch(reject)
				)
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise((resolve, reject) =>
					this.crypto
						.decrypt()
						.fileMetadata({ metadata: file.metadata })
						.then(decrypted => {
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
				)
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
				new Promise((resolve, reject) =>
					this.crypto
						.decrypt()
						.folderMetadata({ metadata: folder.name })
						.then(decrypted => {
							const timestamp = convertTimestampToMs(folder.timestamp)

							items.push({
								type: "directory",
								uuid: folder.uuid,
								name: decrypted.name,
								lastModified: timestamp,
								timestamp,
								color: folder.color,
								parent: folder.parent,
								favorited: folder.favorited === 1
							})

							resolve()
						})
						.catch(reject)
				)
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise((resolve, reject) =>
					this.crypto
						.decrypt()
						.fileMetadata({ metadata: file.metadata })
						.then(decrypted => {
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
				)
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
				new Promise((resolve, reject) =>
					this.crypto
						.decrypt()
						.folderMetadata({ metadata: folder.name })
						.then(decrypted => {
							const timestamp = convertTimestampToMs(folder.timestamp)

							items.push({
								type: "directory",
								uuid: folder.uuid,
								name: decrypted.name,
								lastModified: timestamp,
								timestamp,
								color: folder.color,
								parent: folder.parent,
								favorited: folder.favorited === 1
							})

							resolve()
						})
						.catch(reject)
				)
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise((resolve, reject) =>
					this.crypto
						.decrypt()
						.fileMetadata({ metadata: file.metadata })
						.then(decrypted => {
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
				)
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

		// @TODO checkIf
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

		// @TODO checkIf
	}

	/**
	 * Move a file.
	 * @date 2/15/2024 - 1:27:38 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, to: string}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.to
	 * @returns {Promise<void>}
	 */
	public async moveFile({ uuid, to }: { uuid: string; to: string }): Promise<void> {
		await this.api.v3().file().move({ uuid, to })

		// @TODO checkIf
	}

	/**
	 * Move a directory.
	 * @date 2/15/2024 - 1:27:42 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, to: string}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.to
	 * @returns {Promise<void>}
	 */
	public async moveDirectory({ uuid, to }: { uuid: string; to: string }): Promise<void> {
		await this.api.v3().dir().move({ uuid, to })

		// @TODO checkIf
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

			await this.api.v3().dir().create({ uuid, metadataEncrypted, nameHashed, parent })
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

		// TODO: Queue logic

		if (onStarted) {
			onStarted()
		}

		const lastChunk = chunksEnd ? (chunksEnd === Infinity ? chunks : chunksEnd) : chunks
		const firstChunk = chunksStart ? chunksStart : 0
		const tmpDir = this.sdkConfig.tmpPath ? this.sdkConfig.tmpPath : os.tmpdir()
		const destinationPath = normalizePath(to ? to : pathModule.join(tmpDir, "filen-sdk-downloads", await uuidv4()))
		const tmpChunksPath = normalizePath(pathModule.join(tmpDir, `filen-sdk-chunks-${await uuidv4()}`))
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
								.local({ uuid, bucket, region, chunk: i, to: encryptedTmpChunkPath, abortSignal })

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

							if (onProgress) {
								// TODO: actual progress emitter
								onProgress(index, lastChunk - firstChunk)
							}

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

		// TODO: Queue logic

		if (onStarted) {
			onStarted()
		}

		const threadsSemaphore = this._semaphores.downloadThreads
		const writersSemaphore = this._semaphores.downloadWriters
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
											.buffer({ uuid, bucket, region, chunk: i, abortSignal })

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

										if (onProgress) {
											// TODO: actual progress emitter
											onProgress(index, lastChunk - firstChunk)
										}

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
	 * Tree looks like this:
	 * {
	 * 		"path": CloudItemTree,
	 * 		"path": CloudItemTree,
	 * 		"path": CloudItemTree
	 * }
	 * @date 2/16/2024 - 12:24:25 AM
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
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {DirDownloadType} [param0.type="normal"]
	 * @param {string} param0.linkUUID
	 * @param {boolean} param0.linkHasPassword
	 * @param {string} param0.linkPassword
	 * @param {string} param0.linkSalt
	 * @returns {Promise<Record<string, CloudItemTree>>}
	 */
	public async getDirectoryTree({
		uuid,
		type = "normal",
		linkUUID,
		linkHasPassword,
		linkPassword,
		linkSalt
	}: {
		uuid: string
		type?: DirDownloadType
		linkUUID?: string
		linkHasPassword?: boolean
		linkPassword?: string
		linkSalt?: string
	}): Promise<Record<string, CloudItemTree>> {
		const contents = await this.api.v3().dir().download({ uuid, type, linkUUID, linkHasPassword, linkPassword, linkSalt })
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
				parent: folder.parent
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
		onFinished
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

		// TODO: Queue logic

		if (onStarted) {
			onStarted()
		}

		const tmpDir = this.sdkConfig.tmpPath ? this.sdkConfig.tmpPath : os.tmpdir()
		const destinationPath = normalizePath(to ? to : pathModule.join(tmpDir, "filen-sdk-downloads", await uuidv4()))

		try {
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

				// TODO: Limit file downloads to N using semaphore

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
							to: filePath
							// TODO: progress logic
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
	public async uploadFileFromLocal({
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

		try {
			if (onQueued) {
				onQueued()
			}

			// TODO: Implement queue logic

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
								.buffer({ uuid, index, parent, uploadKey, abortSignal, buffer: encryptedChunkBuffer })

							bucket = uploadResponse.bucket
							region = uploadResponse.region

							done += 1

							this._semaphores.uploadThreads.release()

							if (onProgress) {
								// TODO: actual progress emitter
								onProgress(done, fileChunks)
							}

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

			// TODO: checkIfItemParentIsShared

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

		try {
			if (onQueued) {
				onQueued()
			}

			// TODO: Implement queue logic

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
								.buffer({ uuid, index, parent, uploadKey, abortSignal, buffer: encryptedChunkBuffer })

							bucket = uploadResponse.bucket
							region = uploadResponse.region

							done += 1

							this._semaphores.uploadThreads.release()

							if (onProgress) {
								// TODO: actual progress emitter
								onProgress(done, fileChunks)
							}

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

			// TODO: checkIfItemParentIsShared

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
		}
	}
}

export default Cloud
