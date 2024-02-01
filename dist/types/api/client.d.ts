export type APIClientConfig = {
    apiKey: string;
};
export type BaseRequestParameters = {
    endpoint: string;
    url?: string;
    signal?: AbortSignal;
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
    readonly url: "https://gateway.filen.io";
    readonly timeout: 300000;
    readonly maxRetries: 3;
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
}
export default APIClient;
