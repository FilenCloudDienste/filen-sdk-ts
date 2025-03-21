import type APIClient from "../../../../client"
import { type ProgressCallback } from "../../../../../types"

/**
 * FileDownloadChunkLocal
 * @date 2/15/2024 - 4:38:09 AM
 *
 * @export
 * @class FileDownloadChunkLocal
 * @typedef {FileDownloadChunkLocal}
 */
export class FileDownloadChunkLocal {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of FileDownloadChunkLocal.
	 * @date 2/15/2024 - 4:39:25 AM
	 *
	 * @constructor
	 * @public
	 * @param {{ apiClient: APIClient }} param0
	 * @param {APIClient} param0.apiClient
	 */
	public constructor({ apiClient }: { apiClient: APIClient }) {
		this.apiClient = apiClient
	}

	/**
	 * Download a file chunk.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		bucket: string
	 * 		region: string
	 * 		chunk: number
	 * 		timeout?: number
	 * 		abortSignal?: AbortSignal
	 * 		to: string
	 * 		onProgress?: ProgressCallback
	 * 		onProgressId?: string
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.bucket
	 * @param {string} param0.region
	 * @param {number} param0.chunk
	 * @param {number} param0.timeout
	 * @param {AbortSignal} param0.abortSignal
	 * @param {string} param0.to
	 * @param {ProgressCallback} param0.onProgress
	 * @param {string} param0.onProgressId
	 * @returns {Promise<void>}
	 */
	public async fetch({
		uuid,
		bucket,
		region,
		chunk,
		timeout,
		abortSignal,
		to,
		onProgress,
		onProgressId
	}: {
		uuid: string
		bucket: string
		region: string
		chunk: number
		timeout?: number
		abortSignal?: AbortSignal
		to: string
		onProgress?: ProgressCallback
		onProgressId?: string
	}): Promise<void> {
		await this.apiClient.downloadChunkToLocal({
			uuid,
			bucket,
			region,
			chunk,
			timeout,
			abortSignal,
			to,
			onProgress,
			onProgressId
		})
	}
}

export default FileDownloadChunkLocal
