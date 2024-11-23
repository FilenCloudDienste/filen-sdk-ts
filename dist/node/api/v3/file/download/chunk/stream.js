"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileDownloadChunkStream = void 0;
/**
 * FileDownloadChunkStream
 * @date 2/15/2024 - 4:38:09 AM
 *
 * @export
 * @class FileDownloadChunkStream
 * @typedef {FileDownloadChunkStream}
 */
class FileDownloadChunkStream {
    /**
     * Creates an instance of FileDownloadChunkStream.
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
     * @returns {Promise<ReadableStream | fs.ReadStream>}
     */
    async fetch({ uuid, bucket, region, chunk, timeout, abortSignal, onProgress, onProgressId }) {
        return await this.apiClient.downloadChunkToStream({
            uuid,
            bucket,
            region,
            chunk,
            timeout,
            abortSignal,
            onProgress,
            onProgressId
        });
    }
}
exports.FileDownloadChunkStream = FileDownloadChunkStream;
exports.default = FileDownloadChunkStream;
//# sourceMappingURL=stream.js.map