"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIClient = exports.APIClientDefaults = void 0;
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("../utils");
const constants_1 = require("../constants");
const util_1 = require("util");
const stream_1 = require("stream");
const fs_extra_1 = __importDefault(require("fs-extra"));
const errors_1 = require("./errors");
const utils_2 = require("../crypto/utils");
const semaphore_1 = require("../semaphore");
const https_1 = __importDefault(require("https"));
const url_1 = __importDefault(require("url"));
const progress_stream_1 = __importDefault(require("progress-stream"));
const pipelineAsync = (0, util_1.promisify)(stream_1.pipeline);
exports.APIClientDefaults = {
    gatewayURLs: [
        "https://gateway.filen.io",
        "https://gateway.filen.net",
        "https://gateway.filen-1.net",
        "https://gateway.filen-2.net",
        "https://gateway.filen-3.net",
        "https://gateway.filen-4.net",
        "https://gateway.filen-5.net",
        "https://gateway.filen-6.net"
    ],
    egestURLs: [
        "https://egest.filen.io",
        "https://egest.filen.net",
        "https://egest.filen-1.net",
        "https://egest.filen-2.net",
        "https://egest.filen-3.net",
        "https://egest.filen-4.net",
        "https://egest.filen-5.net",
        "https://egest.filen-6.net"
    ],
    ingestURLs: [
        "https://ingest.filen.io",
        "https://ingest.filen.net",
        "https://ingest.filen-1.net",
        "https://ingest.filen-2.net",
        "https://ingest.filen-3.net",
        "https://ingest.filen-4.net",
        "https://ingest.filen-5.net",
        "https://ingest.filen-6.net"
    ],
    gatewayTimeout: 300000,
    egestTimeout: 1800000,
    ingestTimeout: 3600000,
    maxRetries: 32,
    retryTimeout: 1000
};
/**
 * APIClient
 * @date 2/1/2024 - 2:45:15 AM
 *
 * @export
 * @class APIClient
 * @typedef {APIClient}
 */
class APIClient {
    /**
     * Creates an instance of APIClient.
     * @date 1/31/2024 - 4:09:17 PM
     *
     * @constructor
     * @public
     * @param {APIClientConfig} params
     */
    constructor(params) {
        this.config = {
            apiKey: ""
        };
        this._semaphores = {
            request: new semaphore_1.Semaphore(128)
        };
        this.config = params;
    }
    /**
     * Build API request headers.
     * @date 2/21/2024 - 8:42:27 AM
     *
     * @private
     * @param {?{ apiKey?: string }} [params]
     * @returns {Record<string, string>}
     */
    buildHeaders(params) {
        return {
            Authorization: "Bearer " + (params && params.apiKey ? params.apiKey : this.config.apiKey)
        };
    }
    /**
     * Send a POST request.
     * @date 2/1/2024 - 2:48:57 AM
     *
     * @private
     * @async
     * @param {PostRequestParameters} params
     * @returns {Promise<AxiosResponse<any, any>>}
     */
    async post(params) {
        let headers = params.headers ? params.headers : this.buildHeaders({ apiKey: params.apiKey });
        if (params.apiKey && !headers["apiKey"]) {
            headers["apiKey"] = params.apiKey;
        }
        const url = params.url ? params.url : exports.APIClientDefaults.gatewayURLs[(0, utils_1.getRandomArbitrary)(0, exports.APIClientDefaults.gatewayURLs.length - 1)];
        const postDataIsBuffer = params.data instanceof Buffer || params.data instanceof Uint8Array || params.data instanceof ArrayBuffer;
        if (!params.headers && !postDataIsBuffer) {
            headers = Object.assign(Object.assign({}, headers), { Checksum: await (0, utils_2.bufferToHash)({ buffer: Buffer.from(JSON.stringify(params.data), "utf-8"), algorithm: "sha512" }) });
        }
        let lastBytesUploaded = 0;
        if (constants_1.environment === "node") {
            return new Promise((resolve, reject) => {
                const urlParsed = url_1.default.parse(url, true);
                const timeout = params.timeout ? params.timeout : exports.APIClientDefaults.gatewayTimeout;
                const request = https_1.default.request({
                    method: "POST",
                    hostname: urlParsed.hostname,
                    path: params.endpoint,
                    port: 443,
                    timeout,
                    headers: Object.assign(Object.assign({}, headers), (postDataIsBuffer ? {} : { "Content-Type": "application/json" }))
                }, response => {
                    var _a;
                    if (response.statusCode !== 200) {
                        resolve({
                            status: (_a = response.statusCode) !== null && _a !== void 0 ? _a : 500,
                            statusText: "",
                            data: null,
                            headers,
                            config: null
                        });
                        return;
                    }
                    if (params.responseType === "stream") {
                        resolve({
                            status: 200,
                            statusText: "",
                            data: response,
                            headers,
                            config: null
                        });
                    }
                    else {
                        const chunks = [];
                        response.on("data", chunk => {
                            if (!response || !(chunk instanceof Buffer)) {
                                return;
                            }
                            chunks.push(chunk);
                        });
                        response.on("end", () => {
                            try {
                                resolve({
                                    status: 200,
                                    statusText: "",
                                    data: !params.responseType
                                        ? JSON.parse(Buffer.concat(chunks).toString("utf-8"))
                                        : params.responseType === "json"
                                            ? JSON.parse(Buffer.concat(chunks).toString("utf-8"))
                                            : Buffer.concat(chunks),
                                    headers,
                                    config: null
                                });
                            }
                            catch (e) {
                                reject(e);
                            }
                        });
                    }
                    response.on("error", reject);
                });
                request.on("error", reject);
                request.on("timeout", () => reject(new Error(`Request timed out after ${timeout}ms`)));
                if (postDataIsBuffer) {
                    const readableBuffer = params.data;
                    const progressStreamInstance = (0, progress_stream_1.default)({
                        length: readableBuffer.byteLength,
                        time: 100
                    });
                    progressStreamInstance.on("progress", info => {
                        if (!params.onUploadProgress || !info || typeof info.transferred !== "number") {
                            return;
                        }
                        let bytes = info.transferred;
                        if (lastBytesUploaded === 0) {
                            lastBytesUploaded = info.transferred;
                        }
                        else {
                            bytes = Math.floor(info.transferred - lastBytesUploaded);
                            lastBytesUploaded = info.transferred;
                        }
                        params.onUploadProgress(bytes);
                    });
                    stream_1.Readable.from([readableBuffer]).pipe(progressStreamInstance).pipe(request);
                }
                else {
                    request.write(JSON.stringify(params.data));
                    request.end();
                }
            });
        }
        return await axios_1.default.post(url + params.endpoint, params.data, {
            headers,
            signal: params.abortSignal,
            timeout: params.timeout ? params.timeout : exports.APIClientDefaults.gatewayTimeout,
            responseType: params.responseType ? params.responseType : "json",
            maxRedirects: 0,
            onUploadProgress: event => {
                if (!params.onUploadProgress || !event || typeof event.loaded !== "number") {
                    return;
                }
                let bytes = event.loaded;
                if (lastBytesUploaded === 0) {
                    lastBytesUploaded = event.loaded;
                }
                else {
                    bytes = Math.floor(event.loaded - lastBytesUploaded);
                    lastBytesUploaded = event.loaded;
                }
                params.onUploadProgress(bytes);
            }
        });
    }
    /**
     * Send a GET request.
     * @date 2/1/2024 - 2:49:04 AM
     *
     * @private
     * @async
     * @param {GetRequestParameters} params
     * @returns {Promise<AxiosResponse<any, any>>}
     */
    async get(params) {
        const headers = params.headers ? params.headers : this.buildHeaders({ apiKey: params.apiKey });
        if (params.apiKey && !headers["apiKey"]) {
            headers["apiKey"] = params.apiKey;
        }
        const url = params.url ? params.url : exports.APIClientDefaults.gatewayURLs[(0, utils_1.getRandomArbitrary)(0, exports.APIClientDefaults.gatewayURLs.length - 1)];
        let lastBytesDownloaded = 0;
        if (constants_1.environment === "node") {
            return new Promise((resolve, reject) => {
                const urlParsed = url_1.default.parse(url, true);
                const timeout = params.timeout ? params.timeout : exports.APIClientDefaults.gatewayTimeout;
                const calculateProgress = (transferred) => {
                    if (!params.onDownloadProgress) {
                        return;
                    }
                    let bytes = transferred;
                    if (lastBytesDownloaded === 0) {
                        lastBytesDownloaded = transferred;
                    }
                    else {
                        bytes = Math.floor(transferred - lastBytesDownloaded);
                        lastBytesDownloaded = transferred;
                    }
                    params.onDownloadProgress(bytes);
                };
                const calculateProgressTransform = new stream_1.Transform({
                    transform(chunk, encoding, callback) {
                        if (params.onDownloadProgress && chunk instanceof Buffer) {
                            params.onDownloadProgress(chunk.byteLength);
                        }
                        this.push(chunk);
                        callback();
                    }
                });
                const request = https_1.default.request({
                    method: "GET",
                    hostname: urlParsed.hostname,
                    path: params.endpoint,
                    port: 443,
                    timeout,
                    headers
                }, response => {
                    var _a;
                    if (response.statusCode !== 200) {
                        resolve({
                            status: (_a = response.statusCode) !== null && _a !== void 0 ? _a : 500,
                            statusText: "",
                            data: null,
                            headers,
                            config: null
                        });
                        return;
                    }
                    if (params.responseType === "stream") {
                        resolve({
                            status: 200,
                            statusText: "",
                            data: response.pipe(calculateProgressTransform),
                            headers,
                            config: null
                        });
                    }
                    else {
                        const chunks = [];
                        response.on("data", chunk => {
                            if (!response || !(chunk instanceof Buffer)) {
                                return;
                            }
                            chunks.push(chunk);
                            calculateProgress(chunk.byteLength);
                        });
                        response.on("end", () => {
                            try {
                                resolve({
                                    status: 200,
                                    statusText: "",
                                    data: !params.responseType
                                        ? JSON.parse(Buffer.concat(chunks).toString("utf-8"))
                                        : params.responseType === "json"
                                            ? JSON.parse(Buffer.concat(chunks).toString("utf-8"))
                                            : Buffer.concat(chunks),
                                    headers,
                                    config: null
                                });
                            }
                            catch (e) {
                                reject(e);
                            }
                        });
                    }
                    response.on("error", reject);
                });
                request.on("error", reject);
                request.on("timeout", () => reject(new Error(`Request timed out after ${timeout}ms`)));
                request.end();
            });
        }
        return await axios_1.default.get(url + params.endpoint, {
            headers,
            signal: params.abortSignal,
            timeout: params.timeout ? params.timeout : exports.APIClientDefaults.gatewayTimeout,
            responseType: params.responseType ? params.responseType : "json",
            maxRedirects: 0,
            onDownloadProgress: event => {
                if (!params.onDownloadProgress || !event || typeof event.loaded !== "number") {
                    return;
                }
                let bytes = event.loaded;
                if (lastBytesDownloaded === 0) {
                    lastBytesDownloaded = event.loaded;
                }
                else {
                    bytes = Math.floor(event.loaded - lastBytesDownloaded);
                    lastBytesDownloaded = event.loaded;
                }
                params.onDownloadProgress(bytes);
            }
        });
    }
    /**
     * Sends the request to the API.
     * @date 2/1/2024 - 2:49:20 AM
     *
     * @public
     * @async
     * @template T
     * @param {RequestParameters} params
     * @returns {Promise<T>}
     */
    async request(params) {
        const maxRetries = params.maxRetries ? params.maxRetries : exports.APIClientDefaults.maxRetries;
        const retryTimeout = params.retryTimeout ? params.retryTimeout : exports.APIClientDefaults.retryTimeout;
        let tries = 0;
        let lastError;
        let returnImmediately = false;
        const send = async () => {
            if (tries >= maxRetries) {
                if (lastError) {
                    throw lastError;
                }
                throw new errors_1.APIError({ code: "request_failed_after_max_tries", message: `Request failed after ${maxRetries} tries` });
            }
            tries += 1;
            try {
                const response = params.method === "GET" ? await this.get(params) : await this.post(params);
                if (!response || response.status !== 200) {
                    throw new errors_1.APIError({ code: "invalid_http_status_code", message: `Invalid HTTP status code: ${response.status}` });
                }
                if (typeof response.data === "object" && typeof response.data.status === "boolean" && !response.data.status) {
                    returnImmediately = true;
                    throw new errors_1.APIError({ code: response.data.code, message: response.data.message });
                }
                return response.data.data ? response.data.data : response.data;
            }
            catch (e) {
                if (returnImmediately) {
                    throw e;
                }
                lastError = e;
                await (0, utils_1.sleep)(retryTimeout);
                return await send();
            }
        };
        await this._semaphores.request.acquire();
        try {
            return await send();
        }
        finally {
            this._semaphores.request.release();
        }
    }
    /**
     * Downloads a file chunk to a local path.
     * @date 2/17/2024 - 6:40:58 AM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		bucket: string
     * 		region: string
     * 		chunk: number
     * 		to: string
     * 		timeout?: number
     * 		abortSignal?: AbortSignal
     * 		maxRetries?: number
     * 		retryTimeout?: number
     * 		onProgress?: ProgressCallback
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.bucket
     * @param {string} param0.region
     * @param {number} param0.chunk
     * @param {string} param0.to
     * @param {number} param0.timeout
     * @param {AbortSignal} param0.abortSignal
     * @param {number} param0.maxRetries
     * @param {number} param0.retryTimeout
     * @param {ProgressCallback} param0.onProgress
     * @returns {Promise<void>}
     */
    async downloadChunkToLocal({ uuid, bucket, region, chunk, to, timeout, abortSignal, maxRetries, retryTimeout, onProgress }) {
        if (constants_1.environment !== "node") {
            throw new Error("cloud.downloadChunkToLocal is only available in a Node.JS environment");
        }
        to = (0, utils_1.normalizePath)(to);
        const response = await this.request({
            method: "GET",
            url: `${exports.APIClientDefaults.egestURLs[(0, utils_1.getRandomArbitrary)(0, exports.APIClientDefaults.egestURLs.length - 1)]}`,
            endpoint: `/${region}/${bucket}/${uuid}/${chunk}`,
            abortSignal,
            timeout: timeout ? timeout : exports.APIClientDefaults.egestTimeout,
            responseType: "stream",
            maxRetries,
            retryTimeout,
            onDownloadProgress: onProgress
        });
        await pipelineAsync(response, fs_extra_1.default.createWriteStream(to));
    }
    /**
     * Downloads a file chunk and returns a readable stream.
     * @date 2/17/2024 - 6:40:44 AM
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
     * 		maxRetries?: number
     * 		retryTimeout?: number
     * 		onProgress?: ProgressCallback
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.bucket
     * @param {string} param0.region
     * @param {number} param0.chunk
     * @param {number} param0.timeout
     * @param {AbortSignal} param0.abortSignal
     * @param {number} param0.maxRetries
     * @param {number} param0.retryTimeout
     * @param {ProgressCallback} param0.onProgress
     * @returns {Promise<ReadableStream | fs.ReadStream>}
     */
    async downloadChunkToStream({ uuid, bucket, region, chunk, timeout, abortSignal, maxRetries, retryTimeout, onProgress }) {
        const response = await this.request({
            method: "GET",
            url: `${exports.APIClientDefaults.egestURLs[(0, utils_1.getRandomArbitrary)(0, exports.APIClientDefaults.egestURLs.length - 1)]}`,
            endpoint: `/${region}/${bucket}/${uuid}/${chunk}`,
            abortSignal,
            timeout: timeout ? timeout : exports.APIClientDefaults.egestTimeout,
            responseType: "stream",
            maxRetries,
            retryTimeout,
            onDownloadProgress: onProgress
        });
        return response;
    }
    /**
     * Download a chunk buffer.
     * @date 2/17/2024 - 6:40:21 AM
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
     * 		maxRetries?: number
     * 		retryTimeout?: number,
     * 		onProgress: ProgressCallback
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.bucket
     * @param {string} param0.region
     * @param {number} param0.chunk
     * @param {number} param0.timeout
     * @param {AbortSignal} param0.abortSignal
     * @param {number} param0.maxRetries
     * @param {number} param0.retryTimeout
     * @param {ProgressCallback} param0.onProgress
     * @returns {Promise<Buffer>}
     */
    async downloadChunkToBuffer({ uuid, bucket, region, chunk, timeout, abortSignal, maxRetries, retryTimeout, onProgress }) {
        const response = await this.request({
            method: "GET",
            url: `${exports.APIClientDefaults.egestURLs[(0, utils_1.getRandomArbitrary)(0, exports.APIClientDefaults.egestURLs.length - 1)]}`,
            endpoint: `/${region}/${bucket}/${uuid}/${chunk}`,
            abortSignal,
            timeout: timeout ? timeout : exports.APIClientDefaults.egestTimeout,
            responseType: "arraybuffer",
            maxRetries,
            retryTimeout,
            onDownloadProgress: onProgress
        });
        return Buffer.from(response);
    }
    /**
     * Upload a chunk buffer.
     * @date 2/17/2024 - 5:08:04 AM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		index: number
     * 		parent: string
     * 		uploadKey: string
     * 		buffer: Buffer
     * 		timeout?: number
     * 		abortSignal?: AbortSignal
     * 		maxRetries?: number
     * 		retryTimeout?: number,
     * 		onProgress?: ProgressCallback
     * 	}} param0
     * @param {string} param0.uuid
     * @param {number} param0.index
     * @param {string} param0.parent
     * @param {string} param0.uploadKey
     * @param {Buffer} param0.buffer
     * @param {AbortSignal} param0.abortSignal
     * @param {number} param0.maxRetries
     * @param {number} param0.timeout
     * @param {number} param0.retryTimeout
     * @param {ProgressCallback} param0.onProgress
     * @returns {Promise<UploadChunkResponse>}
     */
    async uploadChunkBuffer({ uuid, index, parent, uploadKey, buffer, abortSignal, maxRetries, timeout, retryTimeout, onProgress }) {
        const urlParams = new URLSearchParams({
            uuid,
            index,
            parent,
            uploadKey
        }).toString();
        const bufferHash = await (0, utils_2.bufferToHash)({ buffer, algorithm: "sha512" });
        const fullURL = `${exports.APIClientDefaults.ingestURLs[(0, utils_1.getRandomArbitrary)(0, exports.APIClientDefaults.ingestURLs.length - 1)]}/v3/upload?${urlParams}&hash=${bufferHash}`;
        const parsedURLParams = (0, utils_1.parseURLParams)({ url: fullURL });
        const urlParamsHash = await (0, utils_2.bufferToHash)({ buffer: Buffer.from(JSON.stringify(parsedURLParams), "utf-8"), algorithm: "sha512" });
        const builtHeaders = this.buildHeaders({ apiKey: undefined });
        const response = await this.request({
            method: "POST",
            url: `${exports.APIClientDefaults.ingestURLs[(0, utils_1.getRandomArbitrary)(0, exports.APIClientDefaults.ingestURLs.length - 1)]}`,
            endpoint: `/v3/upload?${urlParams}&hash=${bufferHash}`,
            data: buffer,
            abortSignal,
            maxRetries,
            timeout: timeout ? timeout : exports.APIClientDefaults.ingestTimeout,
            retryTimeout,
            headers: Object.assign(Object.assign({}, builtHeaders), { Checksum: urlParamsHash }),
            onUploadProgress: onProgress
        });
        return response;
    }
}
exports.APIClient = APIClient;
exports.default = APIClient;
//# sourceMappingURL=client.js.map