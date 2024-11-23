import { Writable } from "stream";
import { Semaphore } from "../semaphore";
import mimeTypes from "mime-types";
import nodeCrypto from "crypto";
import { CHUNK_SIZE, MAX_UPLOAD_THREADS } from "../constants";
/**
 * ChunkedUploadWriter
 * @date 2/29/2024 - 9:58:16 PM
 *
 * @export
 * @class ChunkedUploadWriter
 * @typedef {ChunkedUploadWriter}
 * @extends {Writable}
 */
export class ChunkedUploadWriter extends Writable {
    chunkBuffer;
    uploadSemaphore = new Semaphore(MAX_UPLOAD_THREADS);
    uuid;
    version;
    key;
    bucket;
    region;
    size;
    mime;
    lastModified;
    name;
    index;
    uploadKey;
    parent;
    hasher;
    processingMutex = new Semaphore(1);
    chunksUploaded = 0;
    sdk;
    onProgress;
    onProgressId;
    creation;
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
    constructor({ options = undefined, uuid, key, name, uploadKey, parent, sdk, onProgress, onProgressId, lastModified, creation }) {
        super(options);
        this.onProgress = onProgress;
        this.onProgressId = onProgressId;
        this.sdk = sdk;
        this.chunkBuffer = Buffer.from([]);
        this.uuid = uuid;
        this.key = key;
        this.version = 2;
        this.size = 0;
        this.name = name;
        this.lastModified = lastModified ? lastModified : Date.now();
        this.creation = creation ? creation : Date.now();
        this.mime = mimeTypes.lookup(name) || "application/octet-stream";
        this.bucket = "";
        this.region = "";
        this.index = -1;
        this.uploadKey = uploadKey;
        this.parent = parent;
        this.hasher = nodeCrypto.createHash("sha512");
    }
    /**
     * Write data to the stream.
     * @date 2/29/2024 - 9:58:27 PM
     *
     * @public
     * @param {(Buffer | string)} chunk
     * @param {BufferEncoding} encoding
     * @param {(error?: Error | null | undefined) => void} callback
     */
    _write(chunk, encoding, callback) {
        if (!(chunk instanceof Buffer)) {
            chunk = Buffer.from(chunk, encoding);
        }
        if (chunk.byteLength <= 0) {
            callback();
            return;
        }
        this.uploadSemaphore
            .acquire()
            .then(() => {
            this.chunkBuffer = Buffer.concat([this.chunkBuffer, chunk]);
            if (this.chunkBuffer.byteLength >= CHUNK_SIZE) {
                const chunkToWrite = this.chunkBuffer.subarray(0, CHUNK_SIZE);
                this.chunkBuffer = this.chunkBuffer.subarray(CHUNK_SIZE);
                this.upload(chunkToWrite)
                    .catch(err => {
                    this.destroy(err);
                })
                    .finally(() => {
                    this.uploadSemaphore.release();
                });
            }
            else {
                this.uploadSemaphore.release();
            }
            callback();
        })
            .catch(callback);
    }
    /**
     * Finalize writing.
     * @date 2/29/2024 - 9:58:39 PM
     *
     * @public
     * @param {(error?: Error | null | undefined) => void} callback
     */
    _final(callback) {
        this.processChunks()
            .then(() => {
            this.finalizeUpload()
                .then(() => callback())
                .catch(callback);
        })
            .catch(callback);
    }
    /**
     * Process each chunk.
     * @date 2/29/2024 - 9:58:46 PM
     *
     * @private
     * @async
     * @returns {Promise<void>}
     */
    async processChunks() {
        if (this.chunkBuffer.byteLength <= 0) {
            return;
        }
        while (this.chunkBuffer.byteLength >= CHUNK_SIZE) {
            await this.processingMutex.acquire();
            let chunkToWrite = null;
            try {
                chunkToWrite = this.chunkBuffer.subarray(0, CHUNK_SIZE);
                this.chunkBuffer = this.chunkBuffer.subarray(CHUNK_SIZE);
            }
            finally {
                this.processingMutex.release();
            }
            if (chunkToWrite instanceof Buffer && chunkToWrite.byteLength > 0) {
                await this.upload(chunkToWrite);
            }
        }
    }
    /**
     * Encrypt, hash and upload a chunk.
     * @date 2/29/2024 - 9:58:54 PM
     *
     * @private
     * @async
     * @param {Buffer} chunk
     * @returns {Promise<void>}
     */
    async upload(chunk) {
        if (chunk.byteLength <= 0) {
            return;
        }
        this.index += 1;
        this.size += chunk.byteLength;
        this.hasher.update(chunk);
        const encryptedChunk = await this.sdk.crypto().encrypt().data({
            data: chunk,
            key: this.key
        });
        const response = await this.sdk.getWorker().api.v3.file.upload.chunk.buffer.fetch({
            uuid: this.uuid,
            index: this.index,
            uploadKey: this.uploadKey,
            parent: this.parent,
            buffer: encryptedChunk
        });
        this.bucket = response.bucket;
        this.region = response.region;
        this.chunksUploaded += 1;
        if (this.onProgress) {
            this.onProgress(chunk.byteLength, this.onProgressId);
        }
    }
    /**
     * Wait for all chunks to be uploaded.
     * @date 3/1/2024 - 5:23:57 AM
     *
     * @private
     * @async
     * @param {number} needed
     * @returns {Promise<void>}
     */
    async waitForAllChunksToBeUploaded(needed) {
        await new Promise(resolve => {
            if (this.chunksUploaded >= needed) {
                resolve();
                return;
            }
            const wait = setInterval(() => {
                if (this.chunksUploaded >= needed) {
                    clearInterval(wait);
                    resolve();
                }
            });
        });
    }
    /**
     * Finalize the upload, marking it as done.
     * @date 2/29/2024 - 9:59:20 PM
     *
     * @private
     * @async
     * @returns {Promise<void>}
     */
    async finalizeUpload() {
        // Upload any leftover chunks in the buffer
        await this.processChunks();
        if (this.chunkBuffer.byteLength > 0) {
            await this.upload(this.chunkBuffer);
        }
        if (this.size <= 0) {
            return;
        }
        // Calculate file chunks and size. Warning: This needs to be called AFTER initiating all chunk uploads or it will spit out a wrong chunk count.
        const fileChunks = Math.ceil(this.size / CHUNK_SIZE);
        await this.waitForAllChunksToBeUploaded(fileChunks);
        const hash = this.hasher.digest("hex");
        await this.sdk
            .api(3)
            .upload()
            .done({
            uuid: this.uuid,
            name: await this.sdk.crypto().encrypt().metadata({ metadata: this.name, key: this.key }),
            nameHashed: await this.sdk.crypto().utils.hashFn({ input: this.name.toLowerCase() }),
            size: await this.sdk.crypto().encrypt().metadata({ metadata: this.size.toString(), key: this.key }),
            chunks: fileChunks,
            mime: await this.sdk.crypto().encrypt().metadata({ metadata: this.mime, key: this.key }),
            version: this.version,
            uploadKey: this.uploadKey,
            rm: await this.sdk.crypto().utils.generateRandomString({ length: 32 }),
            metadata: await this.sdk
                .crypto()
                .encrypt()
                .metadata({
                metadata: JSON.stringify({
                    name: this.name,
                    size: this.size,
                    mime: this.mime,
                    key: this.key,
                    lastModified: this.lastModified,
                    creation: this.creation,
                    hash
                })
            })
        });
        await this.sdk.cloud().checkIfItemParentIsShared({
            type: "file",
            parent: this.parent,
            uuid: this.uuid,
            itemMetadata: {
                name: this.name,
                size: this.size,
                mime: this.mime,
                lastModified: this.lastModified,
                creation: this.creation,
                key: this.key,
                hash
            }
        });
        this.emit("uploaded", {
            type: "file",
            uuid: this.uuid,
            metadata: {
                name: this.name,
                size: this.size,
                mime: this.mime,
                key: this.key,
                lastModified: this.lastModified,
                creation: this.creation,
                hash,
                version: this.version,
                region: this.region,
                chunks: fileChunks,
                bucket: this.bucket
            }
        });
    }
}
//# sourceMappingURL=streams.js.map