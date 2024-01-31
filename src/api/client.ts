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

export default class APIClient {
	private readonly config: APIClientConfig = {
		apiKey: ""
	} as const

	public constructor(params: APIClientConfig) {
		this.config = params

		if (this.config.apiKey.length === 0) {
			throw new Error("Invalid apiKey")
		}
	}

	private buildHeaders() {
		return {
			Authorization: "Bearer " + this.config.apiKey
		}
	}

	private async post(params: PostRequestParameters) {
		const headers = this.buildHeaders()
		const url = params.url ? params.url : APIClientDefaults.url

		return await axios.post(url + params.endpoint, params.data, {
			headers,
			signal: params.signal,
			timeout: params.timeout ? params.timeout : APIClientDefaults.timeout
		})
	}

	private async get(params: GetRequestParameters) {
		const headers = this.buildHeaders()
		const url = params.url ? params.url : APIClientDefaults.url

		return await axios.get(url + params.endpoint, {
			headers,
			signal: params.signal,
			timeout: params.timeout ? params.timeout : APIClientDefaults.timeout
		})
	}

	public async request<T>(params: RequestParameters): Promise<T> {
		const maxRetries = params.maxRetries ? params.maxRetries : APIClientDefaults.maxRetries
		const retryTimeout = params.retryTimeout ? params.retryTimeout : APIClientDefaults.retryTimeout
		let tries = 0
		let lastError: Error | unknown

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
					throw new Error(`Invalid status code: ${response.data.code}`)
				}

				return response.data.data ? response.data.data : response.data
			} catch (e) {
				lastError = e

				await sleep(retryTimeout)

				return await send()
			}
		}

		return await send()
	}
}
