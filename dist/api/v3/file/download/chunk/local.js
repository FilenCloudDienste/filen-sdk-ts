"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileDownloadChunkLocal = void 0;
/**
 * FileDownloadChunkLocal
 * @date 2/15/2024 - 4:38:09 AM
 *
 * @export
 * @class FileDownloadChunkLocal
 * @typedef {FileDownloadChunkLocal}
 */
class FileDownloadChunkLocal {
    /**
     * Creates an instance of FileDownloadChunkLocal.
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
     * Download a file chunk.
     * @date 2/17/2024 - 6:38:36 AM
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
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.bucket
     * @param {string} param0.region
     * @param {number} param0.chunk
     * @param {number} param0.timeout
     * @param {AbortSignal} param0.abortSignal
     * @param {string} param0.to
     * @param {ProgressCallback} param0.onProgress
     * @returns {Promise<void>}
     */
    async fetch({ uuid, bucket, region, chunk, timeout, abortSignal, to, onProgress }) {
        await this.apiClient.downloadChunkToLocal({ uuid, bucket, region, chunk, timeout, abortSignal, to, onProgress });
    }
}
exports.FileDownloadChunkLocal = FileDownloadChunkLocal;
exports.default = FileDownloadChunkLocal;
//# sourceMappingURL=local.js.map