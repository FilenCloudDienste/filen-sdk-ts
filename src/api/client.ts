import axios from "axios"
import { sleep, getRandomArbitrary } from "../utils"
import { environment } from "../constants"
import { normalizePath } from "../utils"
import { promisify } from "util"
import { pipeline } from "stream"
import fs from "fs-extra"

const pipelineAsync = promisify(pipeline)

export type APIClientConfig = {
	apiKey: string
}

export type BaseRequestParameters = {
	endpoint: string
	url?: string
	abortSignal?: AbortSignal
	timeout?: number
	maxRetries?: number
	retryTimeout?: number
}

export type GetRequestParameters = BaseRequestParameters & {
	method: "GET"
}

export type PostRequestParameters = BaseRequestParameters & {
	method: "POST"
	data: Record<string, unknown>
}

export type RequestParameters = GetRequestParameters | PostRequestParameters

export const APIClientDefaults = {
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
} as const

/**
 * APIClient
 * @date 2/1/2024 - 2:45:15 AM
 *
 * @export
 * @class APIClient
 * @typedef {APIClient}
 */
export class APIClient {
	private readonly config: APIClientConfig = {
		apiKey: ""
	} as const

	/**
	 * Creates an instance of APIClient.
	 * @date 1/31/2024 - 4:09:17 PM
	 *
	 * @constructor
	 * @public
	 * @param {APIClientConfig} params
	 */
	public constructor(params: APIClientConfig) {
		this.config = params

		if (this.config.apiKey.length === 0) {
			throw new Error("Invalid apiKey, please call login() first")
		}
	}

	/**
	 * Build API request headers
	 * @date 1/31/2024 - 4:09:33 PM
	 *
	 * @private
	 * @returns {Record<string, string>}
	 */
	private buildHeaders(): Record<string, string> {
		return {
			Authorization: "Bearer " + this.config.apiKey
		}
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
	private async post(params: PostRequestParameters) {
		const headers = this.buildHeaders()
		const url = params.url ? params.url : APIClientDefaults.gatewayURLs[getRandomArbitrary(0, APIClientDefaults.gatewayURLs.length - 1)]

		return await axios.post(url + params.endpoint, params.data, {
			headers,
			signal: params.abortSignal,
			timeout: params.timeout ? params.timeout : APIClientDefaults.gatewayTimeout
		})
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
	private async get(params: GetRequestParameters) {
		const headers = this.buildHeaders()
		const url = params.url ? params.url : APIClientDefaults.gatewayURLs[getRandomArbitrary(0, APIClientDefaults.gatewayURLs.length - 1)]

		return await axios.get(url + params.endpoint, {
			headers,
			signal: params.abortSignal,
			timeout: params.timeout ? params.timeout : APIClientDefaults.gatewayTimeout
		})
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
	public async request<T>(params: RequestParameters): Promise<T> {
		const maxRetries = params.maxRetries ? params.maxRetries : APIClientDefaults.maxRetries
		const retryTimeout = params.retryTimeout ? params.retryTimeout : APIClientDefaults.retryTimeout
		let tries = 0
		let lastError: Error | unknown
		let returnImmediately = false

		const send = async (): Promise<T> => {
			if (tries >= maxRetries) {
				if (lastError) {
					throw lastError
				}

				throw new Error(`Request failed after ${maxRetries} tries`)
			}

			tries += 1

			try {
				const response = params.method === "GET" ? await this.get(params) : await this.post(params)

				if (!response || response.status !== 200) {
					throw new Error(`Invalid HTTP status code: ${response.status}`)
				}

				if (!response.data.status) {
					returnImmediately = true

					throw new Error(`Invalid status code: ${response.data.code}`)
				}

				return response.data.data ? response.data.data : response.data
			} catch (e) {
				if (returnImmediately) {
					throw e
				}

				lastError = e

				await sleep(retryTimeout)

				return await send()
			}
		}

		return await send()
	}

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
	public async downloadChunkToLocal({
		uuid,
		bucket,
		region,
		chunk,
		to,
		timeout,
		abortSignal
	}: {
		uuid: string
		bucket: string
		region: string
		chunk: number
		to: string
		timeout?: number
		abortSignal?: AbortSignal
	}): Promise<void> {
		if (environment !== "node") {
			throw new Error("cloud.downloadChunkToLocal is only available in a Node.JS environment")
		}

		to = normalizePath(to)

		const headers = this.buildHeaders()
		const response = await axios.get(
			`${
				APIClientDefaults.egestURLs[getRandomArbitrary(0, APIClientDefaults.egestURLs.length - 1)]
			}/${region}/${bucket}/${uuid}/${chunk}`,
			{
				signal: abortSignal,
				headers,
				timeout: timeout ? timeout : APIClientDefaults.egestTimeout,
				responseType: "stream"
			}
		)
		const responseStream = response.data

		await pipelineAsync(responseStream, fs.createWriteStream(to))
	}

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
	public async downloadChunkToStream({
		uuid,
		bucket,
		region,
		chunk,
		timeout,
		abortSignal
	}: {
		uuid: string
		bucket: string
		region: string
		chunk: number
		timeout?: number
		abortSignal?: AbortSignal
	}): Promise<ReadableStream | fs.ReadStream> {
		const headers = this.buildHeaders()
		const response = await axios.get(
			`${
				APIClientDefaults.egestURLs[getRandomArbitrary(0, APIClientDefaults.egestURLs.length - 1)]
			}/${region}/${bucket}/${uuid}/${chunk}`,
			{
				signal: abortSignal,
				headers,
				timeout: timeout ? timeout : APIClientDefaults.egestTimeout,
				responseType: "stream"
			}
		)

		return response.data
	}

	public async downloadChunkToBuffer({
		uuid,
		bucket,
		region,
		chunk,
		timeout,
		abortSignal
	}: {
		uuid: string
		bucket: string
		region: string
		chunk: number
		timeout?: number
		abortSignal?: AbortSignal
	}): Promise<Buffer> {
		const headers = this.buildHeaders()
		const response = await axios.get(
			`${
				APIClientDefaults.egestURLs[getRandomArbitrary(0, APIClientDefaults.egestURLs.length - 1)]
			}/${region}/${bucket}/${uuid}/${chunk}`,
			{
				signal: abortSignal,
				headers,
				timeout: timeout ? timeout : APIClientDefaults.egestTimeout,
				responseType: "arraybuffer"
			}
		)

		return Buffer.from(response.data as ArrayBuffer)
	}
}

export default APIClient
