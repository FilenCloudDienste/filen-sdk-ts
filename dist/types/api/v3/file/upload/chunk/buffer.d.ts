/// <reference types="node" />
import type { APIClient, UploadChunkResponse } from "../../../../client";
import type { ProgressCallback } from "../../../../../types";
/**
 * FileUploadChunkBuffer
 * @date 2/15/2024 - 4:38:09 AM
 *
 * @export
 * @class FileUploadChunkBuffer
 * @typedef {FileUploadChunkBuffer}
 */
export declare class FileUploadChunkBuffer {
    private readonly apiClient;
    /**
     * Creates an instance of FileUploadChunkBuffer.
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
     * Upload a file chunk buffer.
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
     * 		onProgressId?: string
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
     * @param {string} param0.onProgressId
     * @returns {Promise<UploadChunkResponse>}
     */
    fetch({ uuid, index, parent, uploadKey, abortSignal, maxRetries, retryTimeout, timeout, buffer, onProgress, onProgressId }: {
        uuid: string;
        index: number;
        parent: string;
        uploadKey: string;
        abortSignal?: AbortSignal;
        maxRetries?: number;
        retryTimeout?: number;
        timeout?: number;
        buffer: Buffer;
        onProgress?: ProgressCallback;
        onProgressId?: string;
    }): Promise<UploadChunkResponse>;
}
export default FileUploadChunkBuffer;
