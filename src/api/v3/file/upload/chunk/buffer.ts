import type { APIClient, UploadChunkResponse } from "../../../../client"

/**
 * FileUploadChunkBuffer
 * @date 2/15/2024 - 4:38:09 AM
 *
 * @export
 * @class FileUploadChunkBuffer
 * @typedef {FileUploadChunkBuffer}
 */
export class FileUploadChunkBuffer {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of FileUploadChunkBuffer.
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
	 * Upload a file chunk buffer.
	 * @date 2/16/2024 - 4:57:23 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		index: number,
	 *         parent: string,
	 *         uploadKey: string,
	 *         abortSignal?: AbortSignal,
	 *         maxRetries?: number,
	 *         retryTimeout?: number,
	 *         timeout?: number
	 *         buffer: Buffer
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {number} param0.index
	 * @param {string} param0.parent
	 * @param {string} param0.uploadKey
	 * @param {AbortSignal} param0.abortSignal
	 * @param {number} param0.maxRetries
	 * @param {number} param0.retryTimeout
	 * @param {number} param0.timeout
	 * @param {Buffer} param0.buffer
	 * @returns {Promise<UploadChunkResponse>}
	 */
	public async fetch({
		uuid,
		index,
		parent,
		uploadKey,
		abortSignal,
		maxRetries,
		retryTimeout,
		timeout,
		buffer
	}: {
		uuid: string
		index: number
		parent: string
		uploadKey: string
		abortSignal?: AbortSignal
		maxRetries?: number
		retryTimeout?: number
		timeout?: number
		buffer: Buffer
	}): Promise<UploadChunkResponse> {
		return await this.apiClient.uploadChunkBuffer({
			uuid,
			index,
			parent,
			uploadKey,
			abortSignal,
			maxRetries,
			retryTimeout,
			timeout,
			buffer
		})
	}
}

export default FileUploadChunkBuffer
