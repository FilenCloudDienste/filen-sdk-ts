/// <reference types="node" />
/// <reference types="node" />
import { Writable } from "stream";
import { type ProgressCallback, type FilenSDK } from "..";
/**
 * ChunkedUploadWriter
 * @date 2/29/2024 - 9:58:16 PM
 *
 * @export
 * @class ChunkedUploadWriter
 * @typedef {ChunkedUploadWriter}
 * @extends {Writable}
 */
export declare class ChunkedUploadWriter extends Writable {
    private chunkBuffer;
    private readonly uploadSemaphore;
    private readonly uuid;
    private readonly version;
    private readonly key;
    private bucket;
    private region;
    private size;
    private readonly mime;
    private readonly lastModified;
    private readonly name;
    private index;
    private readonly uploadKey;
    private readonly parent;
    private readonly hasher;
    private readonly processingMutex;
    private chunksUploaded;
    private readonly sdk;
    private readonly onProgress?;
    private readonly onProgressId?;
    private readonly creation;
    /**
     * Creates an instance of ChunkedUploadWriter.
     *
     * @constructor
     * @public
     * @param {{
     * 		options?: ConstructorParameters<typeof Writable>[0]
     * 		sdk: FilenSDK
     * 		uuid: string
     * 		key: string
     * 		name: string
     * 		uploadKey: string
     * 		parent: string
     * 		onProgress?: ProgressCallback
     * 		onProgressId?: string
     * 		lastModified?: number
     * 		creation?: number
     * 	}} param0
     * @param {ConstructorParameters<any>} [param0.options=undefined]
     * @param {string} param0.uuid
     * @param {string} param0.key
     * @param {string} param0.name
     * @param {string} param0.uploadKey
     * @param {string} param0.parent
     * @param {FilenSDK} param0.sdk
     * @param {ProgressCallback} param0.onProgress
     * @param {string} param0.onProgressId
     * @param {number} param0.lastModified
     * @param {number} param0.creation
     */
    constructor({ options, uuid, key, name, uploadKey, parent, sdk, onProgress, onProgressId, lastModified, creation }: {
        options?: ConstructorParameters<typeof Writable>[0];
        sdk: FilenSDK;
        uuid: string;
        key: string;
        name: string;
        uploadKey: string;
        parent: string;
        onProgress?: ProgressCallback;
        onProgressId?: string;
        lastModified?: number;
        creation?: number;
    });
    /**
     * Write data to the stream.
     * @date 2/29/2024 - 9:58:27 PM
     *
     * @public
     * @param {(Buffer | string)} chunk
     * @param {BufferEncoding} encoding
     * @param {(error?: Error | null | undefined) => void} callback
     */
    _write(chunk: Buffer | string, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): void;
    /**
     * Finalize writing.
     * @date 2/29/2024 - 9:58:39 PM
     *
     * @public
     * @param {(error?: Error | null | undefined) => void} callback
     */
    _final(callback: (error?: Error | null | undefined) => void): void;
    /**
     * Process each chunk.
     * @date 2/29/2024 - 9:58:46 PM
     *
     * @private
     * @async
     * @returns {Promise<void>}
     */
    private processChunks;
    /**
     * Encrypt, hash and upload a chunk.
     * @date 2/29/2024 - 9:58:54 PM
     *
     * @private
     * @async
     * @param {Buffer} chunk
     * @returns {Promise<void>}
     */
    private upload;
    /**
     * Wait for all chunks to be uploaded.
     * @date 3/1/2024 - 5:23:57 AM
     *
     * @private
     * @async
     * @param {number} needed
     * @returns {Promise<void>}
     */
    private waitForAllChunksToBeUploaded;
    /**
     * Finalize the upload, marking it as done.
     * @date 2/29/2024 - 9:59:20 PM
     *
     * @private
     * @async
     * @returns {Promise<void>}
     */
    private finalizeUpload;
}
