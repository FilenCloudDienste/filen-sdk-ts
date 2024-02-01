import axios from "axios"
import { sleep } from "../utils"

export type APIClientConfig = {
	apiKey: string
}

export type BaseRequestParameters = {
	endpoint: string
	url?: string
	signal?: AbortSignal
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
	url: "https://gateway.filen.io",
	timeout: 300000,
	maxRetries: 3,
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
	 * @returns {unknown}
	 */
	private async post(params: PostRequestParameters) {
		const headers = this.buildHeaders()
		const url = params.url ? params.url : APIClientDefaults.url

		return await axios.post(url + params.endpoint, params.data, {
			headers,
			signal: params.signal,
			timeout: params.timeout ? params.timeout : APIClientDefaults.timeout
		})
	}

	/**
	 * Send a GET request.
	 * @date 2/1/2024 - 2:49:04 AM
	 *
	 * @private
	 * @async
	 * @param {GetRequestParameters} params
	 * @returns {unknown}
	 */
	private async get(params: GetRequestParameters) {
		const headers = this.buildHeaders()
		const url = params.url ? params.url : APIClientDefaults.url

		return await axios.get(url + params.endpoint, {
			headers,
			signal: params.signal,
			timeout: params.timeout ? params.timeout : APIClientDefaults.timeout
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

				if (typeof response.data.status === "boolean" && response.data.status === false) {
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
}

export default APIClient
