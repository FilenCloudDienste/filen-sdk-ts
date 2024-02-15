import type API from "../api"
import type Crypto from "../crypto"
import type { FilenSDKConfig } from ".."
import type DirColor from "../api/v3/dir/color"
import type { FileEncryptionVersion, FileMetadata, ProgressCallback } from "../types"
import { convertTimestampToMs, promiseAllChunked, uuidv4, normalizePath } from "../utils"
import { environment, MAX_DOWNLOAD_THREADS, MAX_DOWNLOAD_WRITERS } from "../constants"
import { PauseSignal } from "./signals"
import pathModule from "path"
import os from "os"
import fs from "fs-extra"
import { Semaphore } from "../semaphore"
import appendStream from "../streams/append"

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

/**
 * Cloud
 * @date 2/14/2024 - 11:29:58 PM
 *
 * @export
 * @class Cloud
 * @typedef {Cloud}
 */
export class Cloud {
	protected readonly api: API
	protected readonly crypto: Crypto
	protected readonly sdkConfig: FilenSDKConfig

	protected readonly _semaphores = {
		downloadThreads: new Semaphore(MAX_DOWNLOAD_THREADS),
		downloadWriters: new Semaphore(MAX_DOWNLOAD_WRITERS)
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
		}
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
	 * 		name: string
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
	 * @param {string} param0.name
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
		name,
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
		name: string
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
		const destinationPath = normalizePath(to ? to : pathModule.join(tmpDir, "filen-sdk-downloads", name))
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
				if (!pauseSignal || !pauseSignal.isPaused()) {
					resolve()

					return
				}

				const wait = setInterval(() => {
					if (!pauseSignal.isPaused()) {
						clearInterval(wait)

						resolve()
					}
				}, 10)
			})
		}

		const writeToDestination = async ({ index, file }: { index: number; file: string }) => {
			try {
				if (writerStopped) {
					return
				}

				if (abortSignal && abortSignal.aborted) {
					throw new Error("Aborted")
				}

				if (pauseSignal && pauseSignal.isPaused()) {
					await waitForPause()
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

							if (abortSignal && abortSignal.aborted) {
								reject(new Error("Aborted"))

								return
							}

							if (pauseSignal && pauseSignal.isPaused()) {
								await waitForPause()
							}

							const encryptedTmpChunkPath = pathModule.join(tmpChunksPath, `${i}.encrypted`)

							await this.api
								.v3()
								.file()
								.download()
								.chunk()
								.local({ uuid, bucket, region, chunk: i, to: encryptedTmpChunkPath, abortSignal })

							if (abortSignal && abortSignal.aborted) {
								reject(new Error("Aborted"))

								return
							}

							if (pauseSignal && pauseSignal.isPaused()) {
								await waitForPause()
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

			if (onFinished) {
				onFinished()
			}
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
				if (!pauseSignal || !pauseSignal.isPaused()) {
					resolve()

					return
				}

				const wait = setInterval(() => {
					if (!pauseSignal.isPaused()) {
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
							if (writerStopped) {
								return
							}

							if (abortSignal && abortSignal.aborted) {
								throw new Error("Aborted")
							}

							if (pauseSignal && pauseSignal.isPaused()) {
								await waitForPause()
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

										if (abortSignal && abortSignal.aborted) {
											controller.close()

											reject(new Error("Aborted"))

											return
										}

										if (pauseSignal && pauseSignal.isPaused()) {
											await waitForPause()
										}

										const encryptedBuffer = await api
											.v3()
											.file()
											.download()
											.chunk()
											.buffer({ uuid, bucket, region, chunk: i, abortSignal })

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

						if (onFinished) {
							onFinished()
						}
					}
				}
			},
			{
				highWaterMark: 1024 * 1024
			}
		)
	}
}

export default Cloud
