/// <reference types="node" />
/// <reference types="node" />
import fs from "fs-extra";
export type APIClientConfig = {
    apiKey: string;
};
export type BaseRequestParameters = {
    endpoint: string;
    url?: string;
    abortSignal?: AbortSignal;
    timeout?: number;
    maxRetries?: number;
    retryTimeout?: number;
};
export type GetRequestParameters = BaseRequestParameters & {
    method: "GET";
};
export type PostRequestParameters = BaseRequestParameters & {
    method: "POST";
    data: Record<string, unknown>;
};
export type RequestParameters = GetRequestParameters | PostRequestParameters;
export declare const APIClientDefaults: {
    readonly gatewayURLs: readonly ["https://gateway.filen.io", "https://gateway.filen.net", "https://gateway.filen-1.net", "https://gateway.filen-2.net", "https://gateway.filen-3.net", "https://gateway.filen-4.net", "https://gateway.filen-5.net", "https://gateway.filen-6.net"];
    readonly egestURLs: readonly ["https://egest.filen.io", "https://egest.filen.net", "https://egest.filen-1.net", "https://egest.filen-2.net", "https://egest.filen-3.net", "https://egest.filen-4.net", "https://egest.filen-5.net", "https://egest.filen-6.net"];
    readonly ingestURLs: readonly ["https://ingest.filen.io", "https://ingest.filen.net", "https://ingest.filen-1.net", "https://ingest.filen-2.net", "https://ingest.filen-3.net", "https://ingest.filen-4.net", "https://ingest.filen-5.net", "https://ingest.filen-6.net"];
    readonly gatewayTimeout: 300000;
    readonly egestTimeout: 1800000;
    readonly ingestTimeout: 3600000;
    readonly maxRetries: 32;
    readonly retryTimeout: 1000;
};
/**
 * APIClient
 * @date 2/1/2024 - 2:45:15 AM
 *
 * @export
 * @class APIClient
 * @typedef {APIClient}
 */
export declare class APIClient {
    private readonly config;
    /**
     * Creates an instance of APIClient.
     * @date 1/31/2024 - 4:09:17 PM
     *
     * @constructor
     * @public
     * @param {APIClientConfig} params
     */
    constructor(params: APIClientConfig);
    /**
     * Build API request headers
     * @date 1/31/2024 - 4:09:33 PM
     *
     * @private
     * @returns {Record<string, string>}
     */
    private buildHeaders;
    /**
     * Send a POST request.
     * @date 2/1/2024 - 2:48:57 AM
     *
     * @private
     * @async
     * @param {PostRequestParameters} params
     * @returns {Promise<AxiosResponse<any, any>>}
     */
    private post;
    /**
     * Send a GET request.
     * @date 2/1/2024 - 2:49:04 AM
     *
     * @private
     * @async
     * @param {GetRequestParameters} params
     * @returns {Promise<AxiosResponse<any, any>>}
     */
    private get;
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
    request<T>(params: RequestParameters): Promise<T>;
    /**
     * Downloads a file chunk to a local path.
     * @date 2/15/2024 - 4:33:17 AM
     *
     * @public
     * @async
     * @param {{uuid: string, bucket: string, region: string, chunk: number, to: string, timeout?: number, abortSignal?: AbortSignal}} param0
     * @param {string} param0.uuid
     * @param {string} param0.bucket
     * @param {string} param0.region
     * @param {number} param0.chunk
     * @param {string} param0.to
     * @param {number} param0.timeout
     * @param {AbortSignal} param0.abortSignal
     * @returns {Promise<void>}
     */
    downloadChunkToLocal({ uuid, bucket, region, chunk, to, timeout, abortSignal }: {
        uuid: string;
        bucket: string;
        region: string;
        chunk: number;
        to: string;
        timeout?: number;
        abortSignal?: AbortSignal;
    }): Promise<void>;
    /**
     * Downloads a file chunk and returns a readable stream.
     * @date 2/15/2024 - 4:36:47 AM
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
     * @returns {Promise<ReadableStream | fs.ReadStream>}
     */
    downloadChunkToStream({ uuid, bucket, region, chunk, timeout, abortSignal }: {
        uuid: string;
        bucket: string;
        region: string;
        chunk: number;
        timeout?: number;
        abortSignal?: AbortSignal;
    }): Promise<ReadableStream | fs.ReadStream>;
    downloadChunkToBuffer({ uuid, bucket, region, chunk, timeout, abortSignal }: {
        uuid: string;
        bucket: string;
        region: string;
        chunk: number;
        timeout?: number;
        abortSignal?: AbortSignal;
    }): Promise<Buffer>;
}
export default APIClient;
