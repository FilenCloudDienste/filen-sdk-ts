/// <reference types="node" />
import type APIClient from "../../../../client";
/**
 * FileDownloadChunkBuffer
 * @date 2/15/2024 - 4:38:09 AM
 *
 * @export
 * @class FileDownloadChunkBuffer
 * @typedef {FileDownloadChunkBuffer}
 */
export declare class FileDownloadChunkBuffer {
    private readonly apiClient;
    /**
     * Creates an instance of FileDownloadChunkBuffer.
     * @date 2/15/2024 - 4:39:25 AM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }: {
        apiClient: APIClient;
    });
    /**
     * Download a file chunk.
     * @date 2/15/2024 - 5:10:49 AM
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
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.bucket
     * @param {string} param0.region
     * @param {number} param0.chunk
     * @param {number} param0.timeout
     * @param {AbortSignal} param0.abortSignal
     * @returns {Promise<void | ReadableStream | fs.ReadStream | Buffer>}
     */
    fetch({ uuid, bucket, region, chunk, timeout, abortSignal }: {
        uuid: string;
        bucket: string;
        region: string;
        chunk: number;
        timeout?: number;
        abortSignal?: AbortSignal;
    }): Promise<Buffer>;
}
export default FileDownloadChunkBuffer;
