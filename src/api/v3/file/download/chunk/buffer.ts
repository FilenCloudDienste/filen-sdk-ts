import type APIClient from "../../../../client"
import type { ProgressCallback } from "../../../../../types"

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
	 * @date 2/17/2024 - 6:39:08 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		bucket: string
	 * 		region: string
	 * 		chunk: number
	 * 		timeout?: number
	 * 		abortSignal?: AbortSignal,
	 * 		onProgress?: ProgressCallback
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.bucket
	 * @param {string} param0.region
	 * @param {number} param0.chunk
	 * @param {number} param0.timeout
	 * @param {AbortSignal} param0.abortSignal
	 * @param {ProgressCallback} param0.onProgress
	 * @returns {Promise<Buffer>}
	 */
	public async fetch({
		uuid,
		bucket,
		region,
		chunk,
		timeout,
		abortSignal,
		onProgress
	}: {
		uuid: string
		bucket: string
		region: string
		chunk: number
		timeout?: number
		abortSignal?: AbortSignal
		onProgress?: ProgressCallback
	}): Promise<Buffer> {
		return await this.apiClient.downloadChunkToBuffer({ uuid, bucket, region, chunk, timeout, abortSignal, onProgress })
	}
}

export default FileDownloadChunkBuffer
