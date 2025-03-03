import type APIClient from "../../../../client"
import { type ProgressCallback } from "../../../../../types"

/**
 * FileDownloadChunkBuffer
 * @date 2/15/2024 - 4:38:09 AM
 *
 * @export
 * @class FileDownloadChunkBuffer
 * @typedef {FileDownloadChunkBuffer}
 */
export class FileDownloadChunkBuffer {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of FileDownloadChunkBuffer.
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
	 * 		onProgress?: ProgressCallback
	 * 		onProgressId?: string
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.bucket
	 * @param {string} param0.region
	 * @param {number} param0.chunk
	 * @param {number} param0.timeout
	 * @param {AbortSignal} param0.abortSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @param {string} param0.onProgressId
	 * @returns {Promise<Buffer>}
	 */
	public async fetch({
		uuid,
		bucket,
		region,
		chunk,
		timeout,
		abortSignal,
		onProgress,
		onProgressId
	}: {
		uuid: string
		bucket: string
		region: string
		chunk: number
		timeout?: number
		abortSignal?: AbortSignal
		onProgress?: ProgressCallback
		onProgressId?: string
	}): Promise<Buffer> {
		return await this.apiClient.downloadChunkToBuffer({
			uuid,
			bucket,
			region,
			chunk,
			timeout,
			abortSignal,
			onProgress,
			onProgressId
		})
	}
}

export default FileDownloadChunkBuffer
