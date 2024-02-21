"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadChunkBuffer = void 0;
/**
 * FileUploadChunkBuffer
 * @date 2/15/2024 - 4:38:09 AM
 *
 * @export
 * @class FileUploadChunkBuffer
 * @typedef {FileUploadChunkBuffer}
 */
class FileUploadChunkBuffer {
    /**
     * Creates an instance of FileUploadChunkBuffer.
     * @date 2/15/2024 - 4:39:25 AM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }) {
        this.apiClient = apiClient;
    }
    /**
     * Upload a file chunk buffer.
     * @date 2/20/2024 - 9:14:45 PM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		index: number
     * 		parent: string
     * 		uploadKey: string
     * 		abortSignal?: AbortSignal
     * 		maxRetries?: number
     * 		retryTimeout?: number
     * 		timeout?: number
     * 		buffer: Buffer
     * 		onProgress?: ProgressCallback
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
     * @param {ProgressCallback} param0.onProgress
     * @returns {Promise<UploadChunkResponse>}
     */
    async fetch({ uuid, index, parent, uploadKey, abortSignal, maxRetries, retryTimeout, timeout, buffer, onProgress }) {
        return await this.apiClient.uploadChunkBuffer({
            uuid,
            index,
            parent,
            uploadKey,
            abortSignal,
            maxRetries,
            retryTimeout,
            timeout,
            buffer,
            onProgress
        });
    }
}
exports.FileUploadChunkBuffer = FileUploadChunkBuffer;
exports.default = FileUploadChunkBuffer;
//# sourceMappingURL=buffer.js.map