import { type FSItem, type FilenSDK, APIError } from ".."
import {
	type FileEncryptionVersion,
	type FileMetadata,
	type ProgressCallback,
	type FolderMetadata,
	type PublicLinkExpiration,
	type ProgressWithTotalCallback,
	type GetFileResult,
	type GetDirResult
} from "../types"
import {
	convertTimestampToMs,
	promiseAllChunked,
	uuidv4,
	normalizePath,
	getEveryPossibleDirectoryPath,
	realFileSize,
	promiseAllSettledChunked
} from "../utils"
import {
	environment,
	MAX_DOWNLOAD_THREADS,
	MAX_DOWNLOAD_WRITERS,
	MAX_UPLOAD_THREADS,
	DEFAULT_UPLOAD_BUCKET,
	DEFAULT_UPLOAD_REGION,
	UPLOAD_CHUNK_SIZE,
	MAX_CONCURRENT_DOWNLOADS,
	MAX_CONCURRENT_UPLOADS,
	MAX_CONCURRENT_DIRECTORY_DOWNLOADS,
	MAX_CONCURRENT_DIRECTORY_UPLOADS,
	MAX_CONCURRENT_SHARES,
	BUFFER_SIZE
} from "../constants"
import { PauseSignal } from "./signals"
import pathModule from "path"
import os from "os"
import fs from "fs-extra"
import { Semaphore } from "../semaphore"
import { type DirColors } from "../api/v3/dir/color"
import { type FileVersionsResponse } from "../api/v3/file/versions"
import { type DirDownloadType } from "../api/v3/dir/download"
import mimeTypes from "mime-types"
import utils from "./utils"
import { type DirLinkStatusResponse } from "../api/v3/dir/link/status"
import { type FileLinkStatusResponse } from "../api/v3/file/link/status"
import { type FileLinkPasswordResponse } from "../api/v3/file/link/password"
import { type DirLinkInfoDecryptedResponse } from "../api/v3/dir/link/info"
import { type FileLinkInfoResponse } from "../api/v3/file/link/info"
import { type DirLinkContentDecryptedResponse } from "../api/v3/dir/link/content"
import { promisify } from "util"
import { pipeline, Readable, Transform } from "stream"
import { type ReadableStream as ReadableStreamWebType } from "stream/web"
import { ChunkedUploadWriter } from "./streams"
import { type FileExistsResponse } from "../api/v3/file/exists"
import { type DirExistsResponse } from "../api/v3/dir/exists"

const pipelineAsync = promisify(pipeline)

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
	color: DirColors | null
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
			"color" | "favorited"
	  >
	| Omit<
			{
				type: "file"
			} & CloudItemBase &
				CloudItemFile,
			"favorited" | "rm"
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
	private readonly sdk: FilenSDK

	private readonly _semaphores = {
		downloadStream: new Semaphore(MAX_CONCURRENT_DOWNLOADS),
		downloadToLocal: new Semaphore(MAX_CONCURRENT_DOWNLOADS),
		uploads: new Semaphore(MAX_CONCURRENT_UPLOADS),
		directoryDownloads: new Semaphore(MAX_CONCURRENT_DIRECTORY_DOWNLOADS),
		directoryUploads: new Semaphore(MAX_CONCURRENT_DIRECTORY_UPLOADS),
		createDirectory: new Semaphore(1),
		share: new Semaphore(MAX_CONCURRENT_SHARES)
	}

	public constructor(sdk: FilenSDK) {
		this.sdk = sdk
	}

	public readonly utils = {
		signals: {
			PauseSignal
		},
		utils
	}

	/**
	 * Lists all files and directories in a directory.
	 * @date 3/14/2024 - 5:21:55 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string, onlyDirectories?: boolean }} param0
	 * @param {string} param0.uuid
	 * @param {boolean} param0.onlyDirectories
	 * @returns {Promise<CloudItem[]>}
	 */
	public async listDirectory({ uuid, onlyDirectories }: { uuid: string; onlyDirectories?: boolean }): Promise<CloudItem[]> {
		const content = await this.sdk.api(3).dir().content({
			uuid,
			dirsOnly: onlyDirectories
		})
		const items: CloudItem[] = []
		const promises: Promise<void>[] = []

		for (const folder of content.folders) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this.sdk
						.getWorker()
						.crypto.decrypt.folderMetadata({
							metadata: folder.name
						})
						.then(decrypted => {
							const timestamp = convertTimestampToMs(folder.timestamp)

							items.push({
								type: "directory",
								uuid: folder.uuid,
								name: decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${folder.uuid}`,
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
				)
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this.sdk
						.getWorker()
						.crypto.decrypt.fileMetadata({
							metadata: file.metadata
						})
						.then(decrypted => {
							items.push({
								type: "file",
								uuid: file.uuid,
								name: decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${file.uuid}`,
								size: realFileSize({
									chunksSize: file.size,
									metadataDecrypted: decrypted
								}),
								mime: decrypted.name.length > 0 ? decrypted.mime : "application/octet-stream",
								lastModified: convertTimestampToMs(decrypted.name.length > 0 ? decrypted.lastModified : file.timestamp),
								timestamp: convertTimestampToMs(file.timestamp),
								parent: file.parent,
								rm: file.rm,
								version: file.version,
								chunks: file.chunks,
								favorited: file.favorited === 1,
								key: decrypted.name.length > 0 ? decrypted.key : "",
								bucket: file.bucket,
								region: file.region,
								creation: decrypted.name.length > 0 ? decrypted.creation : undefined,
								hash: decrypted.name.length > 0 ? decrypted.hash : undefined
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
		const content = await this.sdk.api(3).shared().in({
			uuid
		})
		const items: CloudItemShared[] = []
		const promises: Promise<void>[] = []

		for (const folder of content.folders) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this.sdk
						.getWorker()
						.crypto.decrypt.folderMetadataPrivate({
							metadata: folder.metadata
						})
						.then(decrypted => {
							const timestamp = convertTimestampToMs(folder.timestamp)

							items.push({
								type: "directory",
								uuid: folder.uuid,
								name: decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${folder.uuid}`,
								lastModified: timestamp,
								timestamp,
								color: folder.color,
								parent: folder.parent ?? "shared-in",
								sharerEmail: folder.sharerEmail ?? "",
								sharerId: folder.sharerId ?? 0,
								receiverEmail: folder.receiverEmail ?? "",
								receiverId: folder.receiverId ?? 0,
								receivers: [],
								size: 0
							})

							resolve()
						})
						.catch(reject)
				)
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this.sdk
						.getWorker()
						.crypto.decrypt.fileMetadataPrivate({
							metadata: file.metadata
						})
						.then(decrypted => {
							items.push({
								type: "file",
								uuid: file.uuid,
								name: decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${file.uuid}`,
								size: realFileSize({
									chunksSize: file.size,
									metadataDecrypted: decrypted
								}),
								mime: decrypted.name.length > 0 ? decrypted.mime : "application/octet-stream",
								lastModified: convertTimestampToMs(decrypted.name.length > 0 ? decrypted.lastModified : file.timestamp),
								timestamp: convertTimestampToMs(file.timestamp),
								parent: file.parent,
								version: file.version,
								chunks: file.chunks,
								key: decrypted.name.length > 0 ? decrypted.key : "",
								bucket: file.bucket,
								region: file.region,
								creation: decrypted.name.length > 0 ? decrypted.creation : undefined,
								hash: decrypted.name.length > 0 ? decrypted.hash : undefined,
								sharerEmail: file.sharerEmail ?? "",
								sharerId: file.sharerId ?? 0,
								receiverEmail: file.receiverEmail ?? "",
								receiverId: file.receiverId ?? 0,
								receivers: []
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
		const content = await this.sdk.api(3).shared().out({
			uuid,
			receiverId
		})
		const items: CloudItemShared[] = []
		const promises: Promise<void>[] = []

		for (const folder of content.folders) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this.sdk
						.getWorker()
						.crypto.decrypt.folderMetadata({
							metadata: folder.metadata
						})
						.then(decrypted => {
							const timestamp = convertTimestampToMs(folder.timestamp)

							items.push({
								type: "directory",
								uuid: folder.uuid,
								name: decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${folder.uuid}`,
								lastModified: timestamp,
								timestamp,
								color: folder.color,
								parent: folder.parent ?? "shared-in",
								sharerEmail: folder.sharerEmail ?? "",
								sharerId: folder.sharerId ?? 0,
								receiverEmail: folder.receiverEmail ?? "",
								receiverId: folder.receiverId ?? 0,
								receivers: [],
								size: 0
							})

							resolve()
						})
						.catch(reject)
				)
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this.sdk
						.getWorker()
						.crypto.decrypt.fileMetadata({
							metadata: file.metadata
						})
						.then(decrypted => {
							items.push({
								type: "file",
								uuid: file.uuid,
								name: decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${file.uuid}`,
								size: realFileSize({
									chunksSize: file.size,
									metadataDecrypted: decrypted
								}),
								mime: decrypted.name.length > 0 ? decrypted.mime : "application/octet-stream",
								lastModified: convertTimestampToMs(decrypted.name.length > 0 ? decrypted.lastModified : file.timestamp),
								timestamp: convertTimestampToMs(file.timestamp),
								parent: file.parent,
								version: file.version,
								chunks: file.chunks,
								key: decrypted.name.length > 0 ? decrypted.key : "",
								bucket: file.bucket,
								region: file.region,
								creation: decrypted.name.length > 0 ? decrypted.creation : undefined,
								hash: decrypted.name.length > 0 ? decrypted.hash : undefined,
								sharerEmail: file.sharerEmail ?? "",
								sharerId: file.sharerId ?? 0,
								receiverEmail: file.receiverEmail ?? "",
								receiverId: file.receiverId ?? 0,
								receivers: []
							})

							resolve()
						})
						.catch(reject)
				)
			)
		}

		await promiseAllChunked(promises)

		const groups: CloudItemShared[] = []
		const sharedTo: Record<string, CloudItemReceiver[]> = {}
		const added: Record<string, boolean> = {}

		for (const item of items) {
			if (sharedTo[item.uuid] && Array.isArray(sharedTo[item.uuid])) {
				sharedTo[item.uuid]!.push({
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
			if (items[i] && Array.isArray(sharedTo[items[i]!.uuid])) {
				items[i]!.receivers = sharedTo[items[i]!.uuid]!
			}

			if (items[i] && !added[items[i]!.uuid]) {
				added[items[i]!.uuid] = true

				groups.push(items[i]!)
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
		const content = await this.sdk.api(3).dir().content({
			uuid: "recents"
		})
		const items: CloudItem[] = []
		const promises: Promise<void>[] = []

		for (const file of content.uploads) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this.sdk
						.getWorker()
						.crypto.decrypt.fileMetadata({
							metadata: file.metadata
						})
						.then(decrypted => {
							items.push({
								type: "file",
								uuid: file.uuid,
								name: decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${file.uuid}`,
								size: realFileSize({
									chunksSize: file.size,
									metadataDecrypted: decrypted
								}),
								mime: decrypted.name.length > 0 ? decrypted.mime : "application/octet-stream",
								lastModified: convertTimestampToMs(decrypted.name.length > 0 ? decrypted.lastModified : file.timestamp),
								timestamp: convertTimestampToMs(file.timestamp),
								parent: file.parent,
								rm: file.rm,
								version: file.version,
								chunks: file.chunks,
								favorited: file.favorited === 1,
								key: decrypted.name.length > 0 ? decrypted.key : "",
								bucket: file.bucket,
								region: file.region,
								creation: decrypted.name.length > 0 ? decrypted.creation : undefined,
								hash: decrypted.name.length > 0 ? decrypted.hash : undefined
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
		const content = await this.sdk.api(3).dir().content({
			uuid: "trash"
		})
		const items: CloudItem[] = []
		const promises: Promise<void>[] = []

		for (const folder of content.folders) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this.sdk
						.getWorker()
						.crypto.decrypt.folderMetadata({
							metadata: folder.name
						})
						.then(decrypted => {
							const timestamp = convertTimestampToMs(folder.timestamp)

							items.push({
								type: "directory",
								uuid: folder.uuid,
								name: decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${folder.uuid}`,
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
				)
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this.sdk
						.getWorker()
						.crypto.decrypt.fileMetadata({
							metadata: file.metadata
						})
						.then(decrypted => {
							items.push({
								type: "file",
								uuid: file.uuid,
								name: decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${file.uuid}`,
								size: realFileSize({
									chunksSize: file.size,
									metadataDecrypted: decrypted
								}),
								mime: decrypted.name.length > 0 ? decrypted.mime : "application/octet-stream",
								lastModified: convertTimestampToMs(decrypted.name.length > 0 ? decrypted.lastModified : file.timestamp),
								timestamp: convertTimestampToMs(file.timestamp),
								parent: file.parent,
								rm: file.rm,
								version: file.version,
								chunks: file.chunks,
								favorited: file.favorited === 1,
								key: decrypted.name.length > 0 ? decrypted.key : "",
								bucket: file.bucket,
								region: file.region,
								creation: decrypted.name.length > 0 ? decrypted.creation : undefined,
								hash: decrypted.name.length > 0 ? decrypted.hash : undefined
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
		const content = await this.sdk.api(3).dir().content({
			uuid: "favorites"
		})
		const items: CloudItem[] = []
		const promises: Promise<void>[] = []

		for (const folder of content.folders) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this.sdk
						.getWorker()
						.crypto.decrypt.folderMetadata({
							metadata: folder.name
						})
						.then(decrypted => {
							const timestamp = convertTimestampToMs(folder.timestamp)

							items.push({
								type: "directory",
								uuid: folder.uuid,
								name: decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${folder.uuid}`,
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
				)
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this.sdk
						.getWorker()
						.crypto.decrypt.fileMetadata({
							metadata: file.metadata
						})
						.then(decrypted => {
							items.push({
								type: "file",
								uuid: file.uuid,
								name: decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${file.uuid}`,
								size: realFileSize({
									chunksSize: file.size,
									metadataDecrypted: decrypted
								}),
								mime: decrypted.name.length > 0 ? decrypted.mime : "application/octet-stream",
								lastModified: convertTimestampToMs(decrypted.name.length > 0 ? decrypted.lastModified : file.timestamp),
								timestamp: convertTimestampToMs(file.timestamp),
								parent: file.parent,
								rm: file.rm,
								version: file.version,
								chunks: file.chunks,
								favorited: file.favorited === 1,
								key: decrypted.name.length > 0 ? decrypted.key : "",
								bucket: file.bucket,
								region: file.region,
								creation: decrypted.name.length > 0 ? decrypted.creation : undefined,
								hash: decrypted.name.length > 0 ? decrypted.hash : undefined
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
		const content = await this.sdk.api(3).dir().content({
			uuid: "links"
		})
		const items: CloudItem[] = []
		const promises: Promise<void>[] = []

		for (const folder of content.folders) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this.sdk
						.getWorker()
						.crypto.decrypt.folderMetadata({
							metadata: folder.name
						})
						.then(decrypted => {
							const timestamp = convertTimestampToMs(folder.timestamp)

							items.push({
								type: "directory",
								uuid: folder.uuid,
								name: decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${folder.uuid}`,
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
				)
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise<void>((resolve, reject) =>
					this.sdk
						.getWorker()
						.crypto.decrypt.fileMetadata({
							metadata: file.metadata
						})
						.then(decrypted => {
							items.push({
								type: "file",
								uuid: file.uuid,
								name: decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${file.uuid}`,
								size: realFileSize({
									chunksSize: file.size,
									metadataDecrypted: decrypted
								}),
								mime: decrypted.name.length > 0 ? decrypted.mime : "application/octet-stream",
								lastModified: convertTimestampToMs(decrypted.name.length > 0 ? decrypted.lastModified : file.timestamp),
								timestamp: convertTimestampToMs(file.timestamp),
								parent: file.parent,
								rm: file.rm,
								version: file.version,
								chunks: file.chunks,
								favorited: file.favorited === 1,
								key: decrypted.name.length > 0 ? decrypted.key : "",
								bucket: file.bucket,
								region: file.region,
								creation: decrypted.name.length > 0 ? decrypted.creation : undefined,
								hash: decrypted.name.length > 0 ? decrypted.hash : undefined
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
	 * Check if a file with <NAME> exists in parent.
	 *
	 * @public
	 * @async
	 * @param {{ name: string; parent: string }} param0
	 * @param {string} param0.name
	 * @param {string} param0.parent
	 * @returns {Promise<FileExistsResponse>}
	 */
	public async fileExists({ name, parent }: { name: string; parent: string }): Promise<FileExistsResponse> {
		const nameHashed = await this.sdk.getWorker().crypto.utils.hashFileName({
			name,
			authVersion: this.sdk.config.authVersion!,
			dek: this.sdk.config.masterKeys!.at(-1)
		})
		const exists = await this.sdk.api(3).file().exists({
			nameHashed,
			parent
		})

		return exists
	}

	/**
	 * Check if a directory with <NAME> exists in parent.
	 *
	 * @public
	 * @async
	 * @param {{ name: string; parent: string }} param0
	 * @param {string} param0.name
	 * @param {string} param0.parent
	 * @returns {Promise<DirExistsResponse>}
	 */
	public async directoryExists({ name, parent }: { name: string; parent: string }): Promise<DirExistsResponse> {
		const nameHashed = await this.sdk.getWorker().crypto.utils.hashFileName({
			name,
			authVersion: this.sdk.config.authVersion!,
			dek: this.sdk.config.masterKeys!.at(-1)
		})
		const exists = await this.sdk.api(3).dir().exists({
			nameHashed,
			parent
		})

		return exists
	}

	/**
	 * Edit metadata of a file (currently uses the rename endpoint, might change later).
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; metadata: FileMetadata }} param0
	 * @param {string} param0.uuid
	 * @param {FileMetadata} param0.metadata
	 * @returns {Promise<void>}
	 */
	public async editFileMetadata({ uuid, metadata }: { uuid: string; metadata: FileMetadata }): Promise<void> {
		const get = await this.sdk.api(3).file().get({
			uuid
		})
		const exists = await this.fileExists({
			name: metadata.name,
			parent: get.parent
		})

		if (exists.exists && exists.uuid !== uuid) {
			throw new Error("A file with the same name already exists in this directory.")
		}

		const [nameHashed, metadataEncrypted, nameEncrypted] = await Promise.all([
			this.sdk.getWorker().crypto.utils.hashFileName({
				name: metadata.name,
				authVersion: this.sdk.config.authVersion!,
				dek: this.sdk.config.masterKeys!.at(-1)
			}),
			this.sdk.getWorker().crypto.encrypt.metadata({
				metadata: JSON.stringify(metadata)
			}),
			this.sdk.getWorker().crypto.encrypt.metadata({
				metadata: metadata.name,
				key: metadata.key
			})
		])

		try {
			await this.sdk.api(3).file().metadata({
				uuid,
				metadataEncrypted,
				nameEncrypted,
				nameHashed
			})
		} catch (e) {
			if (e instanceof APIError) {
				if (e.code === "file_not_found") {
					return
				}
			}
		}

		await this.checkIfItemIsSharedForRename({
			uuid,
			itemMetadata: metadata
		})
	}

	/**
	 * Rename a file.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		metadata: FileMetadata
	 * 		name: string
	 * 		overwriteIfExists?: boolean
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {FileMetadata} param0.metadata
	 * @param {string} param0.name
	 * @param {boolean} [param0.overwriteIfExists=false]
	 * @returns {Promise<void>}
	 */
	public async renameFile({
		uuid,
		metadata,
		name,
		overwriteIfExists = false
	}: {
		uuid: string
		metadata: FileMetadata
		name: string
		overwriteIfExists?: boolean
	}): Promise<void> {
		if (metadata.key.length === 0) {
			throw new Error("Invalid metadata key.")
		}

		const isPresent = await this.sdk.api(3).file().present({
			uuid
		})

		if (!isPresent.present) {
			return
		}

		const get = await this.sdk.api(3).file().get({
			uuid
		})
		const exists = await this.fileExists({
			name,
			parent: get.parent
		})

		if (exists.exists && exists.uuid !== uuid) {
			if (overwriteIfExists) {
				await this.trashFile({
					uuid: exists.uuid
				})
			} else {
				throw new Error("A file with the same name already exists in this directory.")
			}
		}

		const [nameHashed, metadataEncrypted, nameEncrypted] = await Promise.all([
			this.sdk.getWorker().crypto.utils.hashFileName({
				name,
				authVersion: this.sdk.config.authVersion!,
				dek: this.sdk.config.masterKeys!.at(-1)
			}),
			this.sdk.getWorker().crypto.encrypt.metadata({
				metadata: JSON.stringify({
					...metadata,
					name
				})
			}),
			this.sdk.getWorker().crypto.encrypt.metadata({
				metadata: name,
				key: metadata.key
			})
		])

		try {
			await this.sdk.api(3).file().rename({
				uuid,
				metadataEncrypted,
				nameEncrypted,
				nameHashed
			})
		} catch (e) {
			if (e instanceof APIError) {
				if (e.code === "file_not_found") {
					return
				}
			}
		}

		await this.checkIfItemIsSharedForRename({
			uuid,
			itemMetadata: metadata
		})
	}

	/**
	 * Rename a directory.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		name: string
	 * 		overwriteIfExists?: boolean
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.name
	 * @param {boolean} [param0.overwriteIfExists=false]
	 * @returns {Promise<void>}
	 */
	public async renameDirectory({
		uuid,
		name,
		overwriteIfExists = false
	}: {
		uuid: string
		name: string
		overwriteIfExists?: boolean
	}): Promise<void> {
		const isPresent = await this.sdk.api(3).dir().present({
			uuid
		})

		if (!isPresent.present) {
			return
		}

		const get = await this.sdk.api(3).dir().get({
			uuid
		})
		const exists = await this.directoryExists({
			name,
			parent: get.parent
		})

		if (exists.exists && exists.uuid !== uuid) {
			if (overwriteIfExists) {
				await this.trashDirectory({
					uuid: exists.uuid
				})
			} else {
				throw new Error("A directory with the same name already exists in this directory.")
			}
		}

		const [nameHashed, metadataEncrypted] = await Promise.all([
			this.sdk.getWorker().crypto.utils.hashFileName({
				name,
				authVersion: this.sdk.config.authVersion!,
				dek: this.sdk.config.masterKeys!.at(-1)
			}),
			this.sdk.getWorker().crypto.encrypt.metadata({
				metadata: JSON.stringify({
					name
				})
			})
		])

		try {
			await this.sdk.api(3).dir().rename({
				uuid,
				metadataEncrypted,
				nameHashed
			})
		} catch (e) {
			if (e instanceof APIError) {
				if (e.code === "folder_not_found") {
					return
				}
			}
		}

		await this.checkIfItemIsSharedForRename({
			uuid,
			itemMetadata: {
				name
			}
		})
	}

	/**
	 * Move a file.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		to: string
	 * 		metadata: FileMetadata
	 * 		overwriteIfExists?: boolean
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.to
	 * @param {FileMetadata} param0.metadata
	 * @param {boolean} [param0.overwriteIfExists=false]
	 * @returns {Promise<void>}
	 */
	public async moveFile({
		uuid,
		to,
		metadata,
		overwriteIfExists = false
	}: {
		uuid: string
		to: string
		metadata: FileMetadata
		overwriteIfExists?: boolean
	}): Promise<void> {
		const exists = await this.fileExists({
			name: metadata.name,
			parent: to
		})

		if (exists.exists) {
			if (exists.uuid === uuid) {
				return
			}

			if (overwriteIfExists) {
				await this.trashFile({
					uuid: exists.uuid
				})
			}
		}

		await this.sdk.api(3).file().move({
			uuid,
			to
		})

		await this.checkIfItemParentIsShared({
			type: "file",
			parent: to,
			uuid,
			itemMetadata: metadata
		})
	}

	/**
	 * Move a directory.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		to: string
	 * 		metadata: FolderMetadata
	 * 		overwriteIfExists?: boolean
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.to
	 * @param {FolderMetadata} param0.metadata
	 * @param {boolean} [param0.overwriteIfExists=false]
	 * @returns {Promise<void>}
	 */
	public async moveDirectory({
		uuid,
		to,
		metadata,
		overwriteIfExists = false
	}: {
		uuid: string
		to: string
		metadata: FolderMetadata
		overwriteIfExists?: boolean
	}): Promise<void> {
		const exists = await this.directoryExists({
			name: metadata.name,
			parent: to
		})

		if (exists.exists) {
			if (exists.uuid === uuid) {
				return
			}

			if (overwriteIfExists) {
				await this.trashDirectory({
					uuid: exists.uuid
				})
			}
		}

		await this.sdk.api(3).dir().move({
			uuid,
			to
		})

		await this.checkIfItemParentIsShared({
			type: "directory",
			parent: to,
			uuid,
			itemMetadata: metadata
		})
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
		await this.sdk.api(3).file().trash({
			uuid
		})
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
		await this.sdk.api(3).dir().trash({
			uuid
		})
	}

	/**
	 * Create a directory under parent.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid?: string
	 * 		name: string
	 * 		parent: string
	 * 		renameIfExists?: boolean
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.name
	 * @param {string} param0.parent
	 * @param {boolean} [param0.renameIfExists=false]
	 * @returns {Promise<string>}
	 */
	public async createDirectory({
		uuid,
		name,
		parent,
		renameIfExists = false
	}: {
		uuid?: string
		name: string
		parent: string
		renameIfExists?: boolean
	}): Promise<string> {
		await this._semaphores.createDirectory.acquire()

		try {
			let uuidToUse = uuid ? uuid : await uuidv4()
			const exists = await this.directoryExists({
				name,
				parent
			})

			if (exists.exists) {
				uuidToUse = exists.uuid

				if (renameIfExists) {
					await this.renameDirectory({
						uuid: uuidToUse,
						name,
						overwriteIfExists: false
					})
				}
			} else {
				const [metadataEncrypted, nameHashed] = await Promise.all([
					this.sdk.getWorker().crypto.encrypt.metadata({
						metadata: JSON.stringify({
							name
						})
					}),
					this.sdk.getWorker().crypto.utils.hashFileName({
						name,
						authVersion: this.sdk.config.authVersion!,
						dek: this.sdk.config.masterKeys!.at(-1)
					})
				])

				await this.sdk.api(3).dir().create({
					uuid: uuidToUse,
					metadataEncrypted,
					nameHashed,
					parent
				})

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
		} finally {
			this._semaphores.createDirectory.release()
		}
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
		await this.sdk.api(3).dir().color({
			uuid,
			color
		})
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
		await this.sdk.api(3).item().favorite({
			uuid,
			type: "folder",
			favorite
		})
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
		await this.sdk.api(3).item().favorite({
			uuid,
			type: "file",
			favorite
		})
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
		await this.sdk.api(3).file().delete().permanent({
			uuid
		})
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
		await this.sdk.api(3).dir().delete().permanent({
			uuid
		})
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
		await this.sdk.api(3).file().restore({
			uuid
		})
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
		await this.sdk.api(3).dir().restore({
			uuid
		})
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
		await this.sdk.api(3).file().version().restore({
			uuid,
			currentUUID
		})

		const restoredFile = await this.getFile({
			uuid
		})

		await this.editFileMetadata({
			uuid,
			metadata: {
				...restoredFile.metadataDecrypted,
				lastModified: Date.now()
			}
		})
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
		return await this.sdk.api(3).file().versions({
			uuid
		})
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
		await this._semaphores.share.acquire()

		try {
			const metadataEncrypted = await this.sdk.getWorker().crypto.encrypt.metadataPublic({
				metadata: JSON.stringify(metadata),
				publicKey
			})

			await this.sdk.api(3).item().share({
				uuid,
				parent,
				email,
				type,
				metadata: metadataEncrypted
			})
		} finally {
			this._semaphores.share.release()
		}
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
		await this._semaphores.share.acquire()

		try {
			const key = await this.sdk.getWorker().crypto.decrypt.folderLinkKey({
				metadata: linkKeyEncrypted
			})

			if (key.length === 0) {
				throw new Error("Invalid key.")
			}

			const metadataEncrypted = await this.sdk.getWorker().crypto.encrypt.metadata({
				metadata: JSON.stringify(metadata),
				key
			})

			await this.sdk.api(3).dir().link().add({
				uuid,
				parent,
				linkUUID,
				type,
				metadata: metadataEncrypted,
				key: linkKeyEncrypted,
				expiration
			})
		} finally {
			this._semaphores.share.release()
		}
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
	 * 		onProgress?: ProgressWithTotalCallback
	 * 	}} param0
	 * @param {("file" | "directory")} param0.type
	 * @param {string} param0.uuid
	 * @param {ProgressWithTotalCallback} param0.onProgress
	 * @returns {Promise<string>}
	 */
	public async enablePublicLink({
		type,
		uuid,
		onProgress
	}: {
		type: "file" | "directory"
		uuid: string
		onProgress?: ProgressWithTotalCallback
	}): Promise<string> {
		const linkUUID = await uuidv4()

		if (type === "directory") {
			const [tree, key] = await Promise.all([
				this.getDirectoryTree({
					uuid
				}),
				this.sdk.getWorker().crypto.utils.generateEncryptionKey({
					use: "metadata",
					authVersion: this.sdk.config.authVersion!
				})
			])

			const linkKeyEncrypted = await this.sdk.getWorker().crypto.encrypt.metadata({
				metadata: key
			})

			let done = 0
			const promises: Promise<void>[] = []
			const total = Object.keys(tree).length

			for (const entry in tree) {
				const item = tree[entry]

				if (!item || (item.type === "file" && item.key.length === 0)) {
					continue
				}

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
									? ({
											name: item.name
									  } satisfies FolderMetadata)
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
									onProgress(done, total)
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

		await this.sdk
			.api(3)
			.file()
			.link()
			.edit({
				uuid: linkUUID,
				fileUUID: uuid,
				expiration: "never",
				password: "empty",
				passwordHashed: await this.sdk.getWorker().crypto.utils.hashFn({
					input: "empty"
				}),
				downloadBtn: true,
				type: "enable",
				salt: await this.sdk.getWorker().crypto.utils.generateRandomHexString(32)
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
		const salt = await this.sdk.getWorker().crypto.utils.generateRandomHexString(32)
		const pass = password && password.length > 0 ? "notempty" : "empty"
		const passHashed =
			password && password.length > 0
				? await this.sdk.getWorker().crypto.utils.deriveKeyFromPassword({
						password,
						salt,
						iterations: 200000,
						hash: "sha512",
						bitLength: 512,
						returnHex: true
				  })
				: "empty"

		if (type === "directory") {
			await this.sdk.api(3).dir().link().edit({
				uuid: itemUUID,
				expiration,
				password: pass,
				passwordHashed: passHashed,
				salt,
				downloadBtn: enableDownload
			})

			return
		}

		if (!linkUUID) {
			throw new Error("[cloud.disablePublicLink] linkUUID undefined, expected: UUIDv4 string")
		}

		await this.sdk.api(3).file().link().edit({
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
			await this.sdk.api(3).dir().link().remove({
				uuid: itemUUID
			})

			return
		}

		if (!linkUUID) {
			throw new Error("[cloud.disablePublicLink] linkUUID undefined, expected: UUIDv4 string")
		}

		await this.sdk
			.api(3)
			.file()
			.link()
			.edit({
				uuid: linkUUID,
				fileUUID: itemUUID,
				expiration: "never",
				password: "empty",
				passwordHashed: await this.sdk.getWorker().crypto.utils.hashPassword({
					password: "empty"
				}),
				salt: await this.sdk.getWorker().crypto.utils.generateRandomHexString(32),
				downloadBtn: true,
				type: "disable"
			})
	}

	public async publicLinkStatus({ type, uuid }: { type: "file"; uuid: string }): Promise<FileLinkStatusResponse>
	public async publicLinkStatus({ type, uuid }: { type: "directory"; uuid: string }): Promise<DirLinkStatusResponse>

	/**
	 * Fetch the status of a public link.
	 *
	 * @public
	 * @async
	 * @param {({type: "file" | "directory", uuid: string})} param0
	 * @param {("file" | "directory")} param0.type
	 * @param {string} param0.uuid
	 * @returns {Promise<DirLinkStatusResponse | FileLinkStatusResponse>}
	 */
	public async publicLinkStatus({
		type,
		uuid
	}: {
		type: "file" | "directory"
		uuid: string
	}): Promise<DirLinkStatusResponse | FileLinkStatusResponse> {
		if (type === "directory") {
			return await this.sdk.api(3).dir().link().status({
				uuid
			})
		}

		return await this.sdk.api(3).file().link().status({
			uuid
		})
	}

	/**
	 * Fetch password info of a public link.
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<FileLinkPasswordResponse>}
	 */
	public async filePublicLinkHasPassword({ uuid }: { uuid: string }): Promise<FileLinkPasswordResponse> {
		return await this.sdk.api(3).file().link().password({
			uuid
		})
	}

	/**
	 * Fetch info of a file public link.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		password?: string
	 * 		salt?: string
	 * 		key: string
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.password
	 * @param {string} param0.salt
	 * @param {string} param0.key
	 * @returns {(Promise<Omit<FileLinkInfoResponse, "size"> & { size: number }>)}
	 */
	public async filePublicLinkInfo({
		uuid,
		password,
		salt,
		key
	}: {
		uuid: string
		password?: string
		salt?: string
		key: string
	}): Promise<Omit<FileLinkInfoResponse, "size"> & { size: number }> {
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		const derivedPassword = password
			? salt && salt.length === 32
				? await this.sdk.getWorker().crypto.utils.deriveKeyFromPassword({
						password,
						salt,
						iterations: 200000,
						hash: "sha512",
						bitLength: 512,
						returnHex: true
				  })
				: await this.sdk.getWorker().crypto.utils.hashFn({
						input: !password ? "empty" : password
				  })
			: await this.sdk.getWorker().crypto.utils.hashFn({
					input: "empty"
			  })

		const info = await this.sdk.api(3).file().link().info({
			uuid,
			password: derivedPassword
		})

		const [nameDecrypted, mimeDecrypted, sizeDecrypted] = await Promise.all([
			this.sdk.getWorker().crypto.decrypt.metadata({
				metadata: info.name,
				key
			}),
			this.sdk.getWorker().crypto.decrypt.metadata({
				metadata: info.mime,
				key
			}),
			this.sdk.getWorker().crypto.decrypt.metadata({
				metadata: info.size,
				key
			})
		])

		return {
			...info,
			name: nameDecrypted.length > 0 ? nameDecrypted : `CANNOT_DECRYPT_NAME_${uuid}`,
			mime: nameDecrypted.length > 0 ? mimeDecrypted : "application/octet-stream",
			size: nameDecrypted.length > 0 ? parseInt(sizeDecrypted) : 1
		}
	}

	/**
	 * Fetch info about a directory public link.
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string, key: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.key
	 * @returns {Promise<DirLinkInfoDecryptedResponse>}
	 */
	public async directoryPublicLinkInfo({ uuid, key }: { uuid: string; key: string }): Promise<DirLinkInfoDecryptedResponse> {
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		const info = await this.sdk.api(3).dir().link().info({
			uuid
		})
		const metadataDecrypted = await this.sdk.getWorker().crypto.decrypt.folderMetadata({
			metadata: info.metadata,
			key
		})

		return {
			...info,
			metadata: {
				name: metadataDecrypted.name.length > 0 ? metadataDecrypted.name : `CANNOT_DECRYPT_NAME_${uuid}`
			}
		}
	}

	/**
	 * Fetch contents of a directory public link or it's children.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		parent: string
	 * 		password?: string
	 * 		salt?: string
	 * 		key: string
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.parent
	 * @param {string} param0.password
	 * @param {string} param0.salt
	 * @param {string} param0.key
	 * @returns {Promise<DirLinkContentDecryptedResponse>}
	 */
	public async directoryPublicLinkContent({
		uuid,
		parent,
		password,
		salt,
		key
	}: {
		uuid: string
		parent: string
		password?: string
		salt?: string
		key: string
	}): Promise<DirLinkContentDecryptedResponse> {
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		const derivedPassword = password
			? salt && salt.length === 32
				? await this.sdk.getWorker().crypto.utils.deriveKeyFromPassword({
						password,
						salt,
						iterations: 200000,
						hash: "sha512",
						bitLength: 512,
						returnHex: true
				  })
				: await this.sdk.getWorker().crypto.utils.hashFn({
						input: !password ? "empty" : password
				  })
			: await this.sdk.getWorker().crypto.utils.hashFn({
					input: "empty"
			  })

		const content = await this.sdk.api(3).dir().link().content({
			uuid,
			parent,
			password: derivedPassword
		})

		return {
			files: await promiseAllChunked(
				content.files.map(
					file =>
						new Promise((resolve, reject) => {
							this.sdk
								.getWorker()
								.crypto.decrypt.fileMetadata({
									metadata: file.metadata,
									key
								})
								.then(decryptedFileMetadata => {
									resolve({
										...file,
										metadata:
											decryptedFileMetadata.name.length > 0
												? decryptedFileMetadata
												: {
														name: `CANNOT_DECRYPT_NAME_${file.uuid}`,
														mime: "application/octet-stream",
														size: realFileSize({
															chunksSize: file.size,
															metadataDecrypted: decryptedFileMetadata
														}),
														lastModified: convertTimestampToMs(file.timestamp),
														creation: undefined,
														hash: undefined,
														key: ""
												  }
									})
								})
								.catch(reject)
						})
				)
			),
			folders: await promiseAllChunked(
				content.folders.map(
					folder =>
						new Promise((resolve, reject) => {
							this.sdk
								.getWorker()
								.crypto.decrypt.folderMetadata({
									metadata: folder.metadata,
									key
								})
								.then(decryptedFolderMetadata => {
									resolve({
										...folder,
										metadata:
											decryptedFolderMetadata.name.length > 0
												? decryptedFolderMetadata
												: {
														name: `CANNOT_DECRYPT_NAME_${folder.uuid}`
												  }
									})
								})
								.catch(reject)
						})
				)
			)
		}
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
		await this.sdk.api(3).item().sharedOut().remove({
			uuid,
			receiverId
		})
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
		await this.sdk.api(3).item().sharedIn().remove({
			uuid
		})
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
	 * 		onProgress?: ProgressWithTotalCallback
	 * 	}} param0
	 * @param {{}} param0.files
	 * @param {{}} param0.directories
	 * @param {string} param0.email
	 * @param {ProgressWithTotalCallback} param0.onProgress
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
		onProgress?: ProgressWithTotalCallback
	}): Promise<void> {
		const publicKey = (
			await this.sdk.api(3).user().publicKey({
				email
			})
		).publicKey
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
					this.getDirectoryTree({
						uuid: directory.uuid
					})
						.then(tree => {
							for (const entry in tree) {
								const item = tree[entry]

								if (!item || (item.type === "file" && item.key.length === 0)) {
									continue
								}

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
								onProgress(done, itemsToShare.length)
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
	 * @public
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
	public async checkIfItemParentIsShared({
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
			this.sdk.api(3).dir().shared({
				uuid: parent
			}),
			this.sdk.api(3).dir().linked({
				uuid: parent
			})
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
					tree = await this.getDirectoryTree({
						uuid
					})
				}

				for (const entry in tree) {
					const item = tree[entry]

					if (!item || (item.type === "file" && item.key.length === 0)) {
						continue
					}

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
					tree = await this.getDirectoryTree({
						uuid
					})
				}

				for (const entry in tree) {
					const item = tree[entry]

					if (!item || (item.type === "file" && item.key.length === 0)) {
						continue
					}

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
		const metadataEncrypted = await this.sdk.getWorker().crypto.encrypt.metadataPublic({
			metadata: JSON.stringify(metadata),
			publicKey
		})

		await this.sdk.api(3).item().sharedRename({
			uuid,
			receiverId,
			metadata: metadataEncrypted
		})
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
		const key = await this.sdk.getWorker().crypto.decrypt.folderLinkKey({
			metadata: linkKeyEncrypted
		})

		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		const metadataEncrypted = await this.sdk.getWorker().crypto.encrypt.metadata({
			metadata: JSON.stringify(metadata),
			key
		})

		await this.sdk.api(3).item().linkedRename({
			uuid,
			linkUUID,
			metadata: metadataEncrypted
		})
	}

	/**
	 * Checks if an item is shared or public linked.
	 * If so, it renames the item.
	 * @date 2/17/2024 - 4:37:30 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		itemMetadata: FileMetadata | FolderMetadata
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {*} param0.itemMetadata
	 * @returns {Promise<void>}
	 */
	public async checkIfItemIsSharedForRename({
		uuid,
		itemMetadata
	}: {
		uuid: string
		itemMetadata: FileMetadata | FolderMetadata
	}): Promise<void> {
		const [isSharingItem, isLinkingItem] = await Promise.all([
			this.sdk.api(3).item().shared({
				uuid
			}),
			this.sdk.api(3).item().linked({
				uuid
			})
		])

		if (!isSharingItem.sharing && !isLinkingItem.link) {
			return
		}

		const promises: Promise<void>[] = []

		if (isSharingItem.sharing) {
			for (const user of isSharingItem.users) {
				promises.push(
					this.renameSharedItem({
						uuid,
						receiverId: user.id,
						metadata: itemMetadata,
						publicKey: user.publicKey
					})
				)
			}
		}

		if (isLinkingItem.link) {
			for (const link of isLinkingItem.links) {
				promises.push(
					this.renamePubliclyLinkedItem({
						uuid,
						linkUUID: link.linkUUID,
						metadata: itemMetadata,
						linkKeyEncrypted: link.linkKey
					})
				)
			}
		}

		if (promises.length > 0) {
			await promiseAllChunked(promises)
		}
	}

	/**
	 * Fetch directory size in bytes, including file and folder count.
	 * @date 2/20/2024 - 9:21:16 PM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, sharerId?: number, receiverId?: number, trash?: boolean}} param0
	 * @param {string} param0.uuid
	 * @param {number} param0.sharerId
	 * @param {number} param0.receiverId
	 * @param {boolean} param0.trash
	 * @returns {Promise<{ size: number; folders: number; files: number }>}
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
	}): Promise<{ size: number; folders: number; files: number }> {
		return await this.sdk.api(3).dir().size({
			uuid,
			sharerId,
			receiverId,
			trash
		})
	}

	/**
	 * Fetch size of a directory inside a public link in bytes, including file and folder count.
	 * @date 2/20/2024 - 9:21:53 PM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, linkUUID: string}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.linkUUID
	 * @returns {Promise<{ size: number, folders: number, files: number }>}
	 */
	public async directorySizePublicLink({
		uuid,
		linkUUID
	}: {
		uuid: string
		linkUUID: string
	}): Promise<{ size: number; folders: number; files: number }> {
		return await this.sdk.api(3).dir().sizeLink({
			uuid,
			linkUUID
		})
	}

	/**
	 * Download a file to a local path. Only works in a Node.JS environment.
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
	 * 		end?: number
	 * 		start?: number
	 * 		to?: string
	 * 		onProgress?: ProgressCallback
	 * 		onProgressId?: string
	 * 		onQueued?: () => void
	 * 		onStarted?: () => void
	 * 		onError?: (err: Error) => void
	 * 		onFinished?: () => void
	 * 		size: number
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.bucket
	 * @param {string} param0.region
	 * @param {number} param0.chunks
	 * @param {FileEncryptionVersion} param0.version
	 * @param {string} param0.key
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {number} param0.start
	 * @param {number} param0.end
	 * @param {string} param0.to
	 * @param {ProgressCallback} param0.onProgress
	 * @param {string} param0.onProgressId
	 * @param {() => void} param0.onQueued
	 * @param {() => void} param0.onStarted
	 * @param {(err: Error) => void} param0.onError
	 * @param {() => void} param0.onFinished
	 * @param {number} param0.size
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
		start,
		end,
		to,
		onProgress,
		onProgressId,
		onQueued,
		onStarted,
		onError,
		onFinished,
		size
	}: {
		uuid: string
		bucket: string
		region: string
		chunks: number
		version: FileEncryptionVersion
		key: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		end?: number
		start?: number
		to?: string
		onProgress?: ProgressCallback
		onProgressId?: string
		onQueued?: () => void
		onStarted?: () => void
		onError?: (err: Error) => void
		onFinished?: () => void
		size: number
	}): Promise<string> {
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		if (environment !== "node") {
			throw new Error(`cloud.downloadFileToLocal is not implemented for ${environment}`)
		}

		if (onQueued) {
			onQueued()
		}

		await this._semaphores.downloadToLocal.acquire()

		try {
			const tmpDir = this.sdk.config.tmpPath ? this.sdk.config.tmpPath : os.tmpdir()
			const destinationPath = normalizePath(to ? to : pathModule.join(tmpDir, "filen-sdk", await uuidv4()))

			await fs.ensureDir(destinationPath)
			await fs.rm(destinationPath, {
				force: true,
				maxRetries: 60 * 10,
				recursive: true,
				retryDelay: 100
			})

			if (size > 0) {
				const readStream = this.downloadFileToReadableStream({
					uuid,
					region,
					bucket,
					version,
					key,
					chunks,
					size,
					abortSignal,
					pauseSignal,
					onProgress,
					onProgressId,
					onError,
					onStarted,
					start,
					end
				}) as unknown as ReadableStreamWebType<Buffer>

				const writeStream = fs.createWriteStream(destinationPath)

				await pipelineAsync(Readable.fromWeb(readStream), writeStream)

				if (onFinished) {
					onFinished()
				}
			} else {
				await fs.writeFile(destinationPath, Buffer.from([]))
			}

			return destinationPath
		} finally {
			this._semaphores.downloadToLocal.release()
		}
	}

	/**
	 * Download a file to a ReadableStream.
	 *
	 * @public
	 * @param {{
	 * 		uuid: string
	 * 		bucket: string
	 * 		region: string
	 * 		version: FileEncryptionVersion
	 * 		key: string
	 * 		size: number
	 * 		chunks: number
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		start?: number
	 * 		end?: number
	 * 		onProgress?: ProgressCallback
	 * 		onProgressId?: string
	 * 		onQueued?: () => void
	 * 		onStarted?: () => void
	 * 		onError?: (err: Error) => void
	 * 		onFinished?: () => void
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.bucket
	 * @param {string} param0.region
	 * @param {FileEncryptionVersion} param0.version
	 * @param {string} param0.key
	 * @param {number} param0.size
	 * @param {number} param0.chunks
	 * @param {AbortSignal} param0.abortSignal
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {number} param0.start
	 * @param {number} param0.end
	 * @param {ProgressCallback} param0.onProgress
	 * @param {string} param0.onProgressId
	 * @param {() => void} param0.onQueued
	 * @param {() => void} param0.onStarted
	 * @param {(err: Error) => void} param0.onError
	 * @param {() => void} param0.onFinished
	 * @returns {ReadableStream<Buffer>}
	 */
	public downloadFileToReadableStream({
		uuid,
		bucket,
		region,
		version,
		key,
		size,
		chunks,
		abortSignal,
		pauseSignal,
		start,
		end,
		onProgress,
		onProgressId,
		onQueued,
		onStarted,
		onError,
		onFinished
	}: {
		uuid: string
		bucket: string
		region: string
		version: FileEncryptionVersion
		key: string
		size: number
		chunks: number
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		start?: number
		end?: number
		onProgress?: ProgressCallback
		onProgressId?: string
		onQueued?: () => void
		onStarted?: () => void
		onError?: (err: Error) => void
		onFinished?: () => void
	}): ReadableStream<Buffer> {
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		if (size <= 0) {
			return new ReadableStream({
				start(controller) {
					controller.close()
				}
			})
		}

		const streamEntireFile = typeof start === "undefined" && typeof end === "undefined"

		if (typeof start === "undefined") {
			start = 0
		}

		if (typeof end === "undefined") {
			end = size - 1
		}

		if (start <= 0 && end <= 0) {
			start = 0
			end = 0
		}

		if (end > size - 1 || start < 0 || start > end) {
			return new ReadableStream({
				start(controller) {
					controller.close()
				}
			})
		}

		const [firstChunkIndex, lastChunkIndex] = utils.calculateChunkIndices({
			start,
			end,
			chunks
		})

		const threadsSemaphore = new Semaphore(MAX_DOWNLOAD_THREADS)
		const writersSemaphore = new Semaphore(MAX_DOWNLOAD_WRITERS)
		const downloadsSemaphore = this._semaphores.downloadStream
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this
		let currentWriteIndex = firstChunkIndex
		let writerStopped = false
		let currentPullIndex = firstChunkIndex
		const chunksPulled: Record<number, boolean> = { [firstChunkIndex]: true }
		const chunksToDownload = lastChunkIndex <= 0 ? 1 : lastChunkIndex >= chunks ? chunks : lastChunkIndex
		let downloadsSemaphoreAcquired = false
		let downloadsSemaphoreReleased = false
		let chunksWritten = 0
		const chunksNeeded = lastChunkIndex - firstChunkIndex <= 0 ? 1 : lastChunkIndex - firstChunkIndex

		if (
			chunksToDownload === 0 ||
			firstChunkIndex > lastChunkIndex ||
			firstChunkIndex < 0 ||
			lastChunkIndex < 0 ||
			lastChunkIndex > chunks ||
			chunksNeeded <= 0
		) {
			return new ReadableStream({
				start(controller) {
					controller.close()
				}
			})
		}

		const waitForPause = async (): Promise<void> => {
			if (!pauseSignal || !pauseSignal.isPaused() || writerStopped || abortSignal?.aborted || chunksWritten >= chunksNeeded) {
				return
			}

			await new Promise<void>(resolve => {
				const wait = setInterval(() => {
					if (!pauseSignal.isPaused() || writerStopped || abortSignal?.aborted || chunksWritten >= chunksNeeded) {
						clearInterval(wait)

						resolve()
					}
				}, 10)
			})
		}

		const waitForPull = async (index: number) => {
			if (chunksPulled[index] || writerStopped || abortSignal?.aborted || chunksWritten >= chunksNeeded) {
				return
			}

			await new Promise<void>(resolve => {
				const wait = setInterval(() => {
					if (chunksPulled[index] || writerStopped || abortSignal?.aborted || chunksWritten >= chunksNeeded) {
						clearInterval(wait)

						resolve()
					}
				}, 10)
			})
		}

		const waitForWritesToBeDone = async () => {
			if (chunksWritten >= chunksNeeded || writerStopped || abortSignal?.aborted) {
				return
			}

			await new Promise<void>(resolve => {
				const wait = setInterval(() => {
					if (chunksWritten >= chunksNeeded || writerStopped || abortSignal?.aborted) {
						clearInterval(wait)

						resolve()
					}
				}, 10)
			})
		}

		const applyBackpressure = async (controller: ReadableStreamDefaultController) => {
			if (writerStopped || abortSignal?.aborted || chunksWritten >= chunksNeeded) {
				return
			}

			if ((controller.desiredSize ?? 1) <= 0) {
				await new Promise<void>(resolve => {
					const wait = setInterval(() => {
						if (
							(controller.desiredSize && controller.desiredSize > 0) ||
							writerStopped ||
							abortSignal?.aborted ||
							chunksWritten >= chunksNeeded
						) {
							clearInterval(wait)

							resolve()
						}
					}, 10)
				})
			}
		}

		const waitForWriteSlot = async (index: number) => {
			if (writerStopped || abortSignal?.aborted || index === currentWriteIndex) {
				return
			}

			await new Promise<void>(resolve => {
				const wait = setInterval(() => {
					if (writerStopped || abortSignal?.aborted || index === currentWriteIndex) {
						clearInterval(wait)

						resolve()
					}
				}, 10)
			})
		}

		return new ReadableStream(
			{
				start(controller) {
					// eslint-disable-next-line no-extra-semi
					;(async () => {
						const write = async ({ index, buffer }: { index: number; buffer: Buffer }): Promise<void> => {
							try {
								if ((abortSignal && abortSignal.aborted) || writerStopped) {
									throw new Error("Aborted")
								}

								if (pauseSignal && pauseSignal.isPaused()) {
									await waitForPause()
								}

								await waitForWriteSlot(index)

								if ((abortSignal && abortSignal.aborted) || writerStopped) {
									throw new Error("Aborted")
								}

								if (pauseSignal && pauseSignal.isPaused()) {
									await waitForPause()
								}

								if (buffer.byteLength > 0) {
									let bufferToEnqueue = buffer

									if (!streamEntireFile) {
										const chunkStartOffset = index * UPLOAD_CHUNK_SIZE
										const startInChunk =
											index === Math.floor(start! / UPLOAD_CHUNK_SIZE) ? start! % UPLOAD_CHUNK_SIZE : 0
										const endInChunk = Math.min(UPLOAD_CHUNK_SIZE, end! - chunkStartOffset + 1)

										bufferToEnqueue = bufferToEnqueue.subarray(startInChunk, endInChunk)
									}

									await applyBackpressure(controller)

									if (!writerStopped && !(abortSignal && abortSignal.aborted)) {
										controller.enqueue(bufferToEnqueue)

										if (onProgress) {
											onProgress(bufferToEnqueue.byteLength, onProgressId)
										}
									}
								}

								currentWriteIndex += 1
								chunksWritten += 1

								writersSemaphore.release()
							} catch (e) {
								writersSemaphore.release()

								throw e
							}
						}

						if (onQueued) {
							onQueued()
						}

						await downloadsSemaphore.acquire()

						downloadsSemaphoreAcquired = true

						if (onStarted) {
							onStarted()
						}

						try {
							await new Promise<void>((resolve, reject) => {
								let done = firstChunkIndex

								for (let index = firstChunkIndex; index < chunksToDownload; index++) {
									// eslint-disable-next-line no-extra-semi
									;(async () => {
										try {
											await waitForPull(index)

											if ((abortSignal && abortSignal.aborted) || writerStopped) {
												throw new Error("Aborted")
											}

											if (pauseSignal && pauseSignal.isPaused()) {
												await waitForPause()
											}

											await Promise.all([threadsSemaphore.acquire(), writersSemaphore.acquire()])

											if ((abortSignal && abortSignal.aborted) || writerStopped) {
												throw new Error("Aborted")
											}

											if (pauseSignal && pauseSignal.isPaused()) {
												await waitForPause()
											}

											const encryptedBuffer = await self.sdk.getWorker().api.v3.file.download.chunk.buffer.fetch({
												uuid,
												bucket,
												region,
												chunk: index,
												abortSignal
											})

											if ((abortSignal && abortSignal.aborted) || writerStopped) {
												throw new Error("Aborted")
											}

											if (pauseSignal && pauseSignal.isPaused()) {
												await waitForPause()
											}

											const decryptedBuffer = await self.sdk.getWorker().crypto.decrypt.data({
												data: encryptedBuffer,
												key,
												version
											})

											if ((abortSignal && abortSignal.aborted) || writerStopped) {
												throw new Error("Aborted")
											}

											if (pauseSignal && pauseSignal.isPaused()) {
												await waitForPause()
											}

											write({
												index,
												buffer: decryptedBuffer
											}).catch(err => {
												writerStopped = true

												reject(err)
											})

											done += 1

											threadsSemaphore.release()

											if (done >= chunksToDownload) {
												resolve()
											}
										} catch (e) {
											threadsSemaphore.release()
											writersSemaphore.release()

											writerStopped = true

											reject(e)
										}
									})()
								}
							})

							await waitForWritesToBeDone()
						} catch (e) {
							if (onError) {
								onError(e as unknown as Error)
							}

							if (!(e instanceof Error && e.message.toLowerCase().includes("aborted"))) {
								throw e
							}
						} finally {
							if (downloadsSemaphoreAcquired && !downloadsSemaphoreReleased) {
								downloadsSemaphoreReleased = true

								downloadsSemaphore.release()
							}

							try {
								controller.close()
							} catch {
								// Noop
							}
						}

						if (onFinished) {
							onFinished()
						}
					})()
				},
				pull() {
					currentPullIndex += 1
					chunksPulled[currentPullIndex] = true
				},
				cancel() {
					writerStopped = true

					if (downloadsSemaphoreAcquired && !downloadsSemaphoreReleased) {
						downloadsSemaphoreReleased = true

						downloadsSemaphore.release()
					}
				}
			},
			{
				highWaterMark: 16,
				size() {
					return UPLOAD_CHUNK_SIZE
				}
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
		skipCache,
		linkKey
	}: {
		uuid: string
		type?: DirDownloadType
		linkUUID?: string
		linkHasPassword?: boolean
		linkPassword?: string
		linkSalt?: string
		skipCache?: boolean
		linkKey?: string
	}): Promise<Record<string, CloudItemTree>> {
		const contents = await this.sdk.api(3).dir().download({
			uuid,
			type,
			linkUUID,
			linkHasPassword,
			linkPassword,
			linkSalt,
			skipCache
		})
		const tree: Record<string, CloudItemTree> = {}
		const folderNames: Record<string, string> = { base: "/" }

		for (const folder of contents.folders) {
			try {
				const decrypted =
					type === "shared"
						? await this.sdk.getWorker().crypto.decrypt.folderMetadataPrivate({
								metadata: folder.name
						  })
						: type === "linked" && linkKey
						? await this.sdk.getWorker().crypto.decrypt.folderMetadataLink({
								metadata: folder.name,
								linkKey
						  })
						: await this.sdk.getWorker().crypto.decrypt.folderMetadata({
								metadata: folder.name
						  })

				const parentPath = folder.parent === "base" ? "" : `${folderNames[folder.parent]}`
				const folderPath =
					folder.parent === "base"
						? "/"
						: pathModule.posix.join(
								parentPath,
								decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${folder.uuid}`
						  )

				folderNames[folder.uuid] = folderPath
				tree[folderPath] = {
					type: "directory",
					uuid: folder.uuid,
					name: decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${folder.uuid}`,
					parent: folder.parent,
					size: 0,
					timestamp: typeof folder.timestamp === "number" ? convertTimestampToMs(folder.timestamp) : Date.now(),
					lastModified: typeof folder.timestamp === "number" ? convertTimestampToMs(folder.timestamp) : Date.now()
				}
			} catch {
				continue
			}
		}

		if (Object.keys(folderNames).length === 0) {
			throw new Error("Could not build directory tree.")
		}

		const promises: Promise<void>[] = []

		for (const file of contents.files) {
			promises.push(
				new Promise((resolve, reject) => {
					const decryptPromise =
						type === "shared"
							? this.sdk.getWorker().crypto.decrypt.fileMetadataPrivate({
									metadata: file.metadata
							  })
							: type === "linked" && linkKey
							? this.sdk.getWorker().crypto.decrypt.fileMetadataLink({
									metadata: file.metadata,
									linkKey
							  })
							: this.sdk.getWorker().crypto.decrypt.fileMetadata({
									metadata: file.metadata
							  })

					decryptPromise
						.then(decrypted => {
							const parentPath = folderNames[file.parent]

							if (!parentPath) {
								resolve()

								return
							}

							const filePath = pathModule.posix.join(
								parentPath,
								decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${file.uuid}`
							)

							if (filePath.length === 0) {
								resolve()

								return
							}

							tree[filePath] = {
								type: "file",
								uuid: file.uuid,
								name: decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${file.uuid}`,
								size: realFileSize({
									chunksSize: file.chunksSize,
									metadataDecrypted: decrypted
								}),
								mime: decrypted.name.length > 0 ? decrypted.mime : "application/octet-stream",
								lastModified: convertTimestampToMs(decrypted.name.length > 0 ? decrypted.lastModified : Date.now()),
								parent: file.parent,
								version: file.version,
								chunks: file.chunks,
								key: decrypted.name.length > 0 ? decrypted.key : "",
								bucket: file.bucket,
								region: file.region,
								creation: decrypted.name.length > 0 ? decrypted.creation : undefined,
								hash: decrypted.name.length > 0 ? decrypted.hash : undefined,
								timestamp: typeof file.timestamp === "number" ? convertTimestampToMs(file.timestamp) : Date.now()
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
	 * 		linkKey?: string
	 * 		to?: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 		onProgressId?: string
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
	 * @param {ProgressCallback} param0.onProgress
	 * @param {string} param0.onProgressId
	 * @param {string} param0.linkKey
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
		onProgress,
		onProgressId,
		linkKey
	}: {
		uuid: string
		type?: DirDownloadType
		linkUUID?: string
		linkHasPassword?: boolean
		linkPassword?: string
		linkSalt?: string
		linkKey?: string
		to?: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onProgressId?: string
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

			const tmpDir = this.sdk.config.tmpPath ? this.sdk.config.tmpPath : os.tmpdir()

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

			const tree = await this.getDirectoryTree({
				uuid,
				type,
				linkUUID,
				linkHasPassword,
				linkPassword,
				linkSalt,
				linkKey
			})
			const promises: Promise<void>[] = []

			for (const path in tree) {
				const item = tree[path]

				if (!item || item.type !== "file" || item.key.length === 0) {
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
							onProgress,
							onProgressId,
							size: item.size
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
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		source: string
	 * 		parent: string
	 * 		name?: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 		onProgressId?: string
	 * 		onQueued?: () => void
	 * 		onStarted?: () => void
	 * 		onError?: (err: Error) => void
	 * 		onFinished?: () => void
	 * 		onUploaded?: (item: CloudItem) => Promise<void>
	 * 	}} param0
	 * @param {string} param0.source
	 * @param {string} param0.parent
	 * @param {string} param0.name
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {AbortSignal} param0.abortSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @param {string} param0.onProgressId
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
		name,
		pauseSignal,
		abortSignal,
		onProgress,
		onProgressId,
		onQueued,
		onStarted,
		onError,
		onFinished,
		onUploaded
	}: {
		source: string
		parent: string
		name?: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onProgressId?: string
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

			const fileName = name ? name : pathModule.basename(source)

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

			const fileSize = fileStats.size
			let fileChunks = Math.ceil(fileSize / UPLOAD_CHUNK_SIZE)
			const lastModified = parseInt(fileStats.mtimeMs.toString())
			const creation = parseInt(fileStats.birthtimeMs.toString())
			let bucket = DEFAULT_UPLOAD_BUCKET
			let region = DEFAULT_UPLOAD_REGION
			const uploadThreads = new Semaphore(MAX_UPLOAD_THREADS)
			let aborted = false

			const [uuid, key, rm, uploadKey] = await Promise.all([
				uuidv4(),
				this.sdk.getWorker().crypto.utils.generateEncryptionKey({
					use: "data",
					authVersion: this.sdk.config.authVersion!
				}),
				this.sdk.getWorker().crypto.utils.generateRandomURLSafeString(32),
				this.sdk.getWorker().crypto.utils.generateRandomURLSafeString(32)
			])

			const version = this.sdk.crypto().encrypt().keyLengthToVersionData(key)

			const [nameEncrypted, mimeEncrypted, sizeEncrypted, metadata, nameHashed] = await Promise.all([
				this.sdk.getWorker().crypto.encrypt.metadata({
					metadata: fileName,
					key
				}),
				this.sdk.getWorker().crypto.encrypt.metadata({
					metadata: mimeType,
					key
				}),
				this.sdk.getWorker().crypto.encrypt.metadata({
					metadata: fileSize.toString(),
					key
				}),
				this.sdk.getWorker().crypto.encrypt.metadata({
					metadata: JSON.stringify({
						name: fileName,
						size: fileSize,
						mime: mimeType,
						key,
						lastModified,
						creation
					})
				}),
				this.sdk.getWorker().crypto.utils.hashFileName({
					name: fileName,
					authVersion: this.sdk.config.authVersion!,
					dek: this.sdk.config.masterKeys!.at(-1)
				})
			])

			if (fileSize > 0) {
				const waitForPause = async (): Promise<void> => {
					if (!pauseSignal || !pauseSignal.isPaused() || abortSignal?.aborted || aborted) {
						return
					}

					await new Promise<void>(resolve => {
						const wait = setInterval(() => {
							if (!pauseSignal.isPaused() || abortSignal?.aborted || aborted) {
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
							await uploadThreads.acquire()

							try {
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

								const encryptedChunkBuffer = await this.sdk.getWorker().crypto.encrypt.data({
									data: chunkBuffer,
									key
								})

								if (pauseSignal && pauseSignal.isPaused()) {
									await waitForPause()
								}

								if (abortSignal && abortSignal.aborted) {
									reject(new Error("Aborted"))

									return
								}

								const uploadResponse = await this.sdk.getWorker().api.v3.file.upload.chunk.buffer.fetch({
									uuid,
									index,
									parent,
									uploadKey,
									abortSignal,
									buffer: encryptedChunkBuffer,
									onProgress,
									onProgressId
								})

								bucket = uploadResponse.bucket
								region = uploadResponse.region

								done += 1

								uploadThreads.release()

								if (done >= fileChunks) {
									resolve()
								}
							} catch (e) {
								aborted = true

								uploadThreads.release()

								throw e
							}
						})().catch(err => {
							aborted = true

							reject(err)
						})
					}
				})
			}

			const done =
				fileSize > 0
					? await this.sdk.api(3).upload().done({
							uuid,
							name: nameEncrypted,
							nameHashed,
							size: sizeEncrypted,
							chunks: fileChunks,
							mime: mimeEncrypted,
							rm,
							metadata,
							version,
							uploadKey
					  })
					: await this.sdk.api(3).upload().empty({
							uuid,
							name: nameEncrypted,
							nameHashed,
							size: sizeEncrypted,
							mime: mimeEncrypted,
							metadata,
							version,
							parent
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
				version,
				chunks: fileChunks,
				favorited: false,
				key,
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
	 * Upload a file using Node.JS streams. It's not as fast as the normal uploadFile function since it's not completely multithreaded.
	 * Only available in a Node.JS environment.
	 * @public
	 * @async
	 * @param {{
	 * 		source: NodeJS.ReadableStream
	 * 		parent: string
	 * 		name: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 		onProgressId?: string
	 * 		onQueued?: () => void
	 * 		onStarted?: () => void
	 * 		onError?: (err: Error) => void
	 * 		onFinished?: () => void
	 * 		onUploaded?: (item: CloudItem) => Promise<void>
	 * 		lastModified?: number
	 * 		creation?: number
	 * 	}} param0
	 * @param {NodeJS.ReadableStream} param0.source
	 * @param {string} param0.parent
	 * @param {string} param0.name
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {AbortSignal} param0.abortSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @param {string} param0.onProgressId
	 * @param {() => void} param0.onQueued
	 * @param {() => void} param0.onStarted
	 * @param {(err: Error) => void} param0.onError
	 * @param {() => void} param0.onFinished
	 * @param {(item: CloudItem) => Promise<void>} param0.onUploaded
	 * @param {number} param0.lastModified
	 * @param {number} param0.creation
	 * @returns {Promise<CloudItem>}
	 */
	public async uploadLocalFileStream({
		source,
		parent,
		name,
		pauseSignal,
		abortSignal,
		onProgress,
		onProgressId,
		onQueued,
		onStarted,
		onError,
		onFinished,
		onUploaded,
		lastModified,
		creation
	}: {
		source: NodeJS.ReadableStream
		parent: string
		name: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onProgressId?: string
		onQueued?: () => void
		onStarted?: () => void
		onError?: (err: Error) => void
		onFinished?: () => void
		onUploaded?: (item: CloudItem) => Promise<void>
		lastModified?: number
		creation?: number
	}): Promise<CloudItem> {
		if (environment !== "node") {
			throw new Error(`cloud.uploadLocalFileStream is not implemented for ${environment}`)
		}

		if (onQueued) {
			onQueued()
		}

		await this._semaphores.uploads.acquire()

		try {
			if (onStarted) {
				onStarted()
			}

			if (name === "." || name === "/" || name.length <= 0) {
				throw new Error("Invalid source file name. ")
			}

			let aborted = false
			let closed = false
			const [uuid, key, uploadKey] = await Promise.all([
				uuidv4(),
				this.sdk.getWorker().crypto.utils.generateEncryptionKey({
					use: "data",
					authVersion: this.sdk.config.authVersion!
				}),
				this.sdk.getWorker().crypto.utils.generateRandomURLSafeString(32)
			])
			const version = this.sdk.crypto().encrypt().keyLengthToVersionData(key)

			const waitForPause = async (): Promise<void> => {
				if (!pauseSignal || !pauseSignal.isPaused() || abortSignal?.aborted || aborted || closed) {
					return
				}

				return await new Promise(resolve => {
					const wait = setInterval(() => {
						if (!pauseSignal.isPaused() || abortSignal?.aborted || aborted || closed) {
							clearInterval(wait)

							resolve()
						}
					}, 10)
				})
			}

			const item = await new Promise<CloudItem>((resolve, reject) => {
				const transformer = new Transform({
					transform(chunk, _, callback) {
						waitForPause()
							.then(() => {
								callback(null, chunk)
							})
							.catch(err => {
								callback(err)
							})
					}
				})

				const writeStream = new ChunkedUploadWriter({
					options: {
						highWaterMark: BUFFER_SIZE
					},
					sdk: this.sdk,
					uuid,
					key,
					uploadKey,
					name,
					parent,
					onProgress,
					onProgressId,
					lastModified,
					creation
				})

				const cleanup = () => {
					try {
						if (!writeStream.destroyed || !writeStream.closed || !writeStream.errored) {
							writeStream.destroy()
						}

						if (!transformer.destroyed || !transformer.closed || !transformer.errored) {
							transformer.destroy()
						}
					} catch {
						// Noop
					}
				}

				writeStream.once("uploaded", (item: FSItem) => {
					resolve({
						type: "file",
						uuid,
						name: item.metadata.name,
						size: item.type === "directory" ? 0 : item.metadata.size,
						mime: item.type === "directory" ? "application/octet-stream" : item.metadata.mime,
						lastModified: item.type === "directory" ? Date.now() : item.metadata.lastModified,
						timestamp: Date.now(),
						parent,
						rm: "",
						version,
						chunks: item.type === "directory" ? 0 : item.metadata.chunks,
						favorited: false,
						key,
						bucket: item.type === "directory" ? "" : item.metadata.bucket,
						region: item.type === "directory" ? "" : item.metadata.region,
						creation: item.type === "directory" ? undefined : item.metadata.creation
					})
				})

				writeStream.once("close", () => {
					closed = true
				})

				writeStream.once("finish", () => {
					closed = true
				})

				transformer.once("close", () => {
					closed = true
				})

				transformer.once("finish", () => {
					closed = true
				})

				source.once("close", () => {
					closed = true
				})

				source.once("finish", () => {
					closed = true
				})

				pipelineAsync(source, transformer, writeStream, {
					signal: abortSignal
				})
					.then(() => {
						closed = true
					})
					.catch(err => {
						aborted = true

						setTimeout(cleanup, 3000)

						reject(err)
					})
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
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		file: File
	 * 		parent: string
	 * 		name?: string
	 * 		uuid?: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 		onProgressId?: string
	 * 		onQueued?: () => void
	 * 		onStarted?: () => void
	 * 		onError?: (err: Error) => void
	 * 		onFinished?: () => void
	 * 		onUploaded?: (item: CloudItem) => Promise<void>
	 * 	}} param0
	 * @param {File} param0.file
	 * @param {string} param0.parent
	 * @param {string} param0.name
	 * @param {string} param0.uuid
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {AbortSignal} param0.abortSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @param {string} param0.onProgressId
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
		name,
		uuid,
		pauseSignal,
		abortSignal,
		onProgress,
		onProgressId,
		onQueued,
		onStarted,
		onError,
		onFinished,
		onUploaded
	}: {
		file: File
		parent: string
		name?: string
		uuid?: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onProgressId?: string
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

			const fileName = name ? name : file.name
			const mimeType = mimeTypes.lookup(fileName) || "application/octet-stream"
			const fileSize = file.size
			let fileChunks = Math.ceil(fileSize / UPLOAD_CHUNK_SIZE)
			const lastModified = file.lastModified
			let bucket = DEFAULT_UPLOAD_BUCKET
			let region = DEFAULT_UPLOAD_REGION
			const uploadThreads = new Semaphore(MAX_UPLOAD_THREADS)
			let aborted = false

			const [fileUUID, key, rm, uploadKey] = await Promise.all([
				uuid ? Promise.resolve(uuid) : uuidv4(),
				this.sdk.getWorker().crypto.utils.generateEncryptionKey({
					use: "data",
					authVersion: this.sdk.config.authVersion!
				}),
				this.sdk.getWorker().crypto.utils.generateRandomURLSafeString(32),
				this.sdk.getWorker().crypto.utils.generateRandomURLSafeString(32)
			])

			const version = this.sdk.crypto().encrypt().keyLengthToVersionData(key)

			const [nameEncrypted, mimeEncrypted, sizeEncrypted, metadata, nameHashed] = await Promise.all([
				this.sdk.getWorker().crypto.encrypt.metadata({
					metadata: fileName,
					key
				}),
				this.sdk.getWorker().crypto.encrypt.metadata({
					metadata: mimeType,
					key
				}),
				this.sdk.getWorker().crypto.encrypt.metadata({
					metadata: fileSize.toString(),
					key
				}),
				this.sdk.getWorker().crypto.encrypt.metadata({
					metadata: JSON.stringify({
						name: fileName,
						size: fileSize,
						mime: mimeType,
						key,
						lastModified
					})
				}),
				this.sdk.getWorker().crypto.utils.hashFileName({
					name: fileName,
					authVersion: this.sdk.config.authVersion!,
					dek: this.sdk.config.masterKeys!.at(-1)
				})
			])

			if (fileSize > 0) {
				const waitForPause = async (): Promise<void> => {
					if (!pauseSignal || !pauseSignal.isPaused() || abortSignal?.aborted || aborted) {
						return
					}

					await new Promise<void>(resolve => {
						const wait = setInterval(() => {
							if (!pauseSignal.isPaused() || abortSignal?.aborted || aborted) {
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
							await uploadThreads.acquire()

							try {
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

								const encryptedChunkBuffer = await this.sdk.getWorker().crypto.encrypt.data({
									data: chunkBuffer,
									key
								})

								if (pauseSignal && pauseSignal.isPaused()) {
									await waitForPause()
								}

								if (abortSignal && abortSignal.aborted) {
									reject(new Error("Aborted"))

									return
								}

								const uploadResponse = await this.sdk.getWorker().api.v3.file.upload.chunk.buffer.fetch({
									uuid: fileUUID,
									index,
									parent,
									uploadKey,
									abortSignal,
									buffer: encryptedChunkBuffer,
									onProgress,
									onProgressId
								})

								bucket = uploadResponse.bucket
								region = uploadResponse.region

								done += 1

								uploadThreads.release()

								if (done >= fileChunks) {
									resolve()
								}
							} catch (e) {
								aborted = true

								uploadThreads.release()

								throw e
							}
						})().catch(err => {
							aborted = true

							reject(err)
						})
					}
				})
			}

			const done =
				fileSize > 0
					? await this.sdk.api(3).upload().done({
							uuid: fileUUID,
							name: nameEncrypted,
							nameHashed,
							size: sizeEncrypted,
							chunks: fileChunks,
							mime: mimeEncrypted,
							rm,
							metadata,
							version,
							uploadKey
					  })
					: await this.sdk.api(3).upload().empty({
							uuid: fileUUID,
							name: nameEncrypted,
							nameHashed,
							size: sizeEncrypted,
							mime: mimeEncrypted,
							metadata,
							version,
							parent
					  })

			fileChunks = done.chunks

			const item: CloudItem = {
				type: "file",
				uuid: fileUUID,
				name: fileName,
				size: fileSize,
				mime: mimeType,
				lastModified,
				timestamp: Date.now(),
				parent,
				rm,
				version,
				chunks: fileChunks,
				favorited: false,
				key,
				bucket,
				region
			}

			await this.checkIfItemParentIsShared({
				type: "file",
				parent,
				uuid: fileUUID,
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
	 * Upload a local file at path. Only works in a Node.JS environment.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		source: string
	 * 		parent: string
	 * 		name?: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 		onProgressId?: string
	 * 		onQueued?: () => void
	 * 		onStarted?: () => void
	 * 		onError?: (err: Error) => void
	 * 		onFinished?: () => void
	 * 		onUploaded?: (item: CloudItem) => Promise<void>
	 * 		onDirectoryCreated?: (item: CloudItem) => void,
	 * 		throwOnSingleFileUploadError?: boolean
	 * 	}} param0
	 * @param {string} param0.source
	 * @param {string} param0.parent
	 * @param {string} param0.name
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {AbortSignal} param0.abortSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @param {string} param0.onProgressId
	 * @param {() => void} param0.onQueued
	 * @param {() => void} param0.onStarted
	 * @param {(err: Error) => void} param0.onError
	 * @param {() => void} param0.onFinished
	 * @param {(item: CloudItem) => Promise<void>} param0.onUploaded
	 * @param {(item: CloudItem) => void} param0.onDirectoryCreated
	 * @param {boolean} param0.throwOnSingleFileUploadError
	 * @returns {Promise<void>}
	 */
	public async uploadLocalDirectory({
		source,
		parent,
		name,
		pauseSignal,
		abortSignal,
		onProgress,
		onProgressId,
		onQueued,
		onStarted,
		onError,
		onFinished,
		onUploaded,
		onDirectoryCreated,
		throwOnSingleFileUploadError
	}: {
		source: string
		parent: string
		name?: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onProgressId?: string
		onQueued?: () => void
		onStarted?: () => void
		onError?: (err: Error) => void
		onFinished?: () => void
		onUploaded?: (item: CloudItem) => Promise<void>
		onDirectoryCreated?: (item: CloudItem) => void
		throwOnSingleFileUploadError?: boolean
	}): Promise<void> {
		if (environment !== "node") {
			throw new Error(`cloud.uploadLocalDirectory is not implemented for ${environment}`)
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

			const baseDirectoryName = name ? name : pathModule.basename(source)

			if (baseDirectoryName === "." || baseDirectoryName === "/" || baseDirectoryName.length <= 0) {
				throw new Error(`Invalid source directory at path ${source}. Could not parse directory name.`)
			}

			parent = await this.createDirectory({
				name: baseDirectoryName,
				parent
			})

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
				if (pathsToUUIDs[entry]) {
					continue
				}

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
				const directoryParent =
					parentPath === "." || parentPath === "/" || parentPath.length <= 0 ? parent : pathsToUUIDs[parentPath] ?? ""

				if (directoryParent.length <= 16) {
					continue
				}

				const directoryName = pathModule.posix.basename(entry)

				if (directoryName.length <= 0) {
					continue
				}

				const uuid = await this.createDirectory({
					name: directoryName,
					parent: directoryParent
				})

				pathsToUUIDs[entry] = uuid

				if (onDirectoryCreated) {
					onDirectoryCreated({
						type: "directory",
						uuid,
						name: directoryName,
						timestamp: Date.now(),
						parent: directoryParent,
						lastModified: Date.now(),
						favorited: false,
						color: null,
						size: 0
					})
				}
			}

			const uploadPromises: Promise<CloudItem>[] = []

			for (const entry of sortedBySeparatorLength) {
				const stats = entryStats[entry]

				if (
					!stats ||
					!stats.isFile() ||
					stats.isSymbolicLink() ||
					stats.isBlockDevice() ||
					stats.isCharacterDevice() ||
					stats.isSocket()
				) {
					continue
				}

				const parentPath = pathModule.posix.dirname(entry)
				const fileParent =
					parentPath === "." || parentPath === "/" || parentPath.length <= 0 ? parent : pathsToUUIDs[parentPath] ?? ""

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
						onProgressId,
						onUploaded
					})
				)
			}

			if (throwOnSingleFileUploadError) {
				await promiseAllChunked(uploadPromises)
			} else {
				await promiseAllSettledChunked(uploadPromises)
			}

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
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		files: { file: File; path: string }[]
	 * 		parent: string
	 * 		name?: string
	 * 		abortSignal?: AbortSignal
	 * 		pauseSignal?: PauseSignal
	 * 		onProgress?: ProgressCallback
	 * 		onProgressId?: string
	 * 		onQueued?: () => void
	 * 		onStarted?: () => void
	 * 		onError?: (err: Error) => void
	 * 		onFinished?: () => void
	 * 		onUploaded?: (item: CloudItem) => Promise<void>
	 * 		onDirectoryCreated?: (item: CloudItem) => void
	 * 		throwOnSingleFileUploadError?: boolean
	 * 	}} param0
	 * @param {{}} param0.files
	 * @param {string} param0.parent
	 * @param {string} param0.name
	 * @param {PauseSignal} param0.pauseSignal
	 * @param {AbortSignal} param0.abortSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @param {string} param0.onProgressId
	 * @param {() => void} param0.onQueued
	 * @param {() => void} param0.onStarted
	 * @param {(err: Error) => void} param0.onError
	 * @param {() => void} param0.onFinished
	 * @param {(item: CloudItem) => Promise<void>} param0.onUploaded
	 * @param {(item: CloudItem) => void} param0.onDirectoryCreated
	 * @param {boolean} param0.throwOnSingleFileUploadError
	 * @returns {Promise<void>}
	 */
	public async uploadDirectoryFromWeb({
		files,
		parent,
		name,
		pauseSignal,
		abortSignal,
		onProgress,
		onProgressId,
		onQueued,
		onStarted,
		onError,
		onFinished,
		onUploaded,
		onDirectoryCreated,
		throwOnSingleFileUploadError
	}: {
		files: { file: File; path: string }[]
		parent: string
		name?: string
		abortSignal?: AbortSignal
		pauseSignal?: PauseSignal
		onProgress?: ProgressCallback
		onProgressId?: string
		onQueued?: () => void
		onStarted?: () => void
		onError?: (err: Error) => void
		onFinished?: () => void
		onUploaded?: (item: CloudItem) => Promise<void>
		onDirectoryCreated?: (item: CloudItem) => void
		throwOnSingleFileUploadError?: boolean
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

			let baseDirectoryName: string | null = name ? name : null
			const pathsToUUIDs: Record<string, string> = {}
			const directoryPaths: string[] = []

			for (let i = 0; i < files.length; i++) {
				const file = files[i]

				if (!file || file.path.length <= 0) {
					continue
				}

				const ex = file.path.split("/")

				if (!name && ex[0] && ex[0].length > 0) {
					baseDirectoryName = ex[0].trim()
				}

				const parentPath = pathModule.posix.dirname(file.path)

				if (!directoryPaths.includes(parentPath)) {
					directoryPaths.push(parentPath)
				}
			}

			if (!baseDirectoryName) {
				throw new Error(`Can not upload directory to parent directory ${parent}. Could not parse base directory name.`)
			}

			for (const path of directoryPaths) {
				const possiblePaths = getEveryPossibleDirectoryPath(path)

				for (const possiblePath of possiblePaths) {
					if (!directoryPaths.includes(possiblePath)) {
						directoryPaths.push(possiblePath)
					}
				}
			}

			const directoryPathsSorted = directoryPaths.sort((a, b) => a.split("/").length - b.split("/").length)

			for (const path of directoryPathsSorted) {
				if (pathsToUUIDs[path]) {
					continue
				}

				const parentPath = pathModule.posix.dirname(path)
				const directoryParent =
					parentPath === "." || parentPath === "/" || parentPath.length <= 0 ? parent : pathsToUUIDs[parentPath] ?? ""

				if (directoryParent.length <= 16) {
					continue
				}

				const directoryName = pathModule.posix.basename(path)

				if (directoryName === "." || directoryName.length <= 0 || directoryName === "/") {
					continue
				}

				const uuid = await this.createDirectory({
					name: directoryName,
					parent: directoryParent
				})

				pathsToUUIDs[path] = uuid

				if (onDirectoryCreated) {
					onDirectoryCreated({
						type: "directory",
						uuid,
						name: directoryName,
						timestamp: Date.now(),
						parent: directoryParent,
						lastModified: Date.now(),
						favorited: false,
						color: null,
						size: 0
					})
				}
			}

			const uploadPromises: Promise<CloudItem>[] = []

			for (let i = 0; i < files.length; i++) {
				const file = files[i]

				if (!file) {
					continue
				}

				const parentPath = pathModule.posix.dirname(file.path)
				const fileParent =
					parentPath === "." || parentPath === "/" || parentPath.length <= 0 ? parent : pathsToUUIDs[parentPath] ?? ""

				if (fileParent.length <= 16) {
					continue
				}

				uploadPromises.push(
					this.uploadWebFile({
						file: file.file,
						parent: fileParent,
						abortSignal,
						pauseSignal,
						onProgress,
						onProgressId,
						onUploaded
					})
				)
			}

			if (throwOnSingleFileUploadError) {
				await promiseAllChunked(uploadPromises)
			} else {
				await promiseAllSettledChunked(uploadPromises)
			}

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
	 * Empty the trash.
	 *
	 * @public
	 * @async
	 * @returns {Promise<void>}
	 */
	public async emptyTrash(): Promise<void> {
		return await this.sdk.api(3).trash().empty()
	}

	/**
	 * Recursively find the full path of a file using it's UUID.
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<string>}
	 */
	public async fileUUIDToPath({ uuid }: { uuid: string }): Promise<string> {
		const pathParts: string[] = []

		const file = await this.sdk.api(3).file().get({
			uuid
		})

		let nextParent = file.parent

		const fileMetadataDecrypted = await this.sdk.getWorker().crypto.decrypt.fileMetadata({
			metadata: file.metadata
		})

		pathParts.push(fileMetadataDecrypted.name.length > 0 ? fileMetadataDecrypted.name : `CANNOT_DECRYPT_NAME_${uuid}`)

		while (nextParent !== this.sdk.config.baseFolderUUID) {
			const dir = await this.sdk.api(3).dir().get({
				uuid: nextParent
			})

			const decrypted = await this.sdk.getWorker().crypto.decrypt.folderMetadata({
				metadata: dir.nameEncrypted
			})

			pathParts.push(decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${dir.uuid}`)

			nextParent = dir.parent
		}

		return `/${pathModule.posix.join(...pathParts.reverse())}`
	}

	/**
	 * Recursively find the full path of a file using it's UUID.
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<string>}
	 */
	public async directoryUUIDToPath({ uuid }: { uuid: string }): Promise<string> {
		const pathParts: string[] = []

		const firstDir = await this.sdk.api(3).dir().get({
			uuid
		})

		let nextParent = firstDir.parent

		const firstDirMetadataDecrypted = await this.sdk.getWorker().crypto.decrypt.folderMetadata({
			metadata: firstDir.nameEncrypted
		})

		pathParts.push(firstDirMetadataDecrypted.name.length > 0 ? firstDirMetadataDecrypted.name : `CANNOT_DECRYPT_NAME_${uuid}`)

		while (nextParent !== this.sdk.config.baseFolderUUID) {
			const dir = await this.sdk.api(3).dir().get({
				uuid: nextParent
			})

			const decrypted = await this.sdk.getWorker().crypto.decrypt.folderMetadata({
				metadata: dir.nameEncrypted
			})

			pathParts.push(decrypted.name.length > 0 ? decrypted.name : `CANNOT_DECRYPT_NAME_${dir.uuid}`)

			nextParent = dir.parent
		}

		return `/${pathModule.posix.join(...pathParts.reverse())}`
	}

	/**
	 * Get info about a file and decrypt its metadata.
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<GetFileResult>}
	 */
	public async getFile({ uuid }: { uuid: string }): Promise<GetFileResult> {
		const file = await this.sdk.api(3).file().get({
			uuid
		})
		const fileMetadataDecrypted = await this.sdk.getWorker().crypto.decrypt.fileMetadata({
			metadata: file.metadata
		})

		return {
			...file,
			metadataDecrypted: fileMetadataDecrypted,
			chunks: Math.ceil(file.size / UPLOAD_CHUNK_SIZE)
		}
	}

	/**
	 * Get info about a directory and decrypt its metadata.
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<GetDirResult>}
	 */
	public async getDirectory({ uuid }: { uuid: string }): Promise<GetDirResult> {
		const dir = await this.sdk.api(3).dir().get({
			uuid
		})
		const dirMetadataDecrypted = await this.sdk.getWorker().crypto.decrypt.folderMetadata({
			metadata: dir.nameEncrypted
		})

		return {
			...dir,
			metadataDecrypted: dirMetadataDecrypted
		}
	}
}

export default Cloud
