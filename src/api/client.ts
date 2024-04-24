import axios, { ResponseType, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { sleep, getRandomArbitrary, normalizePath, parseURLParams } from "../utils"
import { environment } from "../constants"
import { promisify } from "util"
import { pipeline, Readable, Transform } from "stream"
import fs from "fs-extra"
import { APIError } from "./errors"
import { bufferToHash } from "../crypto/utils"
import { Semaphore } from "../semaphore"
import type { ProgressCallback } from "../types"
import https from "https"
import urlModule from "url"
import progressStream from "progress-stream"
import Agent from "agentkeepalive"

const pipelineAsync = promisify(pipeline)
const keepAliveAgent = new Agent.HttpsAgent()

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
	responseType?: ResponseType
	headers?: Record<string, string>
	onUploadProgress?: ProgressCallback
	onDownloadProgress?: ProgressCallback
	apiKey?: string
}

export type GetRequestParameters = BaseRequestParameters & {
	method: "GET"
}

export type PostRequestParameters = BaseRequestParameters & {
	method: "POST"
	data: unknown
}

export type RequestParameters = GetRequestParameters | PostRequestParameters

export type UploadChunkResponse = {
	bucket: string
	region: string
}

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

	private readonly _semaphores = {
		request: new Semaphore(512)
	}

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
	}

	/**
	 * Build API request headers.
	 * @date 2/21/2024 - 8:42:27 AM
	 *
	 * @private
	 * @param {?{ apiKey?: string }} [params]
	 * @returns {Record<string, string>}
	 */
	private buildHeaders(params?: { apiKey?: string }): Record<string, string> {
		return {
			Authorization: "Bearer " + (params && params.apiKey ? params.apiKey : this.config.apiKey),
			Accept: "application/json, text/plain, */*",
			...(environment === "node" ? { "User-Agent": "filen-sdk" } : {})
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
		let headers = params.headers ? params.headers : this.buildHeaders({ apiKey: params.apiKey })

		if (params.apiKey && !headers["Authorization"]) {
			headers["Authorization"] = `Bearer ${params.apiKey}`
		}

		const url = params.url ? params.url : APIClientDefaults.gatewayURLs[getRandomArbitrary(0, APIClientDefaults.gatewayURLs.length - 1)]
		const postDataIsBuffer = params.data instanceof Buffer || params.data instanceof Uint8Array || params.data instanceof ArrayBuffer

		if (!params.headers && !postDataIsBuffer) {
			headers = {
				...headers,
				Checksum: await bufferToHash({ buffer: Buffer.from(JSON.stringify(params.data), "utf-8"), algorithm: "sha512" })
			}
		}

		let lastBytesUploaded = 0

		if (environment === "node") {
			return new Promise<AxiosResponse>((resolve, reject) => {
				const urlParsed = urlModule.parse(url, true)
				const timeout = params.timeout ? params.timeout : APIClientDefaults.gatewayTimeout

				const request = https.request(
					{
						method: "POST",
						hostname: urlParsed.hostname,
						path: params.endpoint,
						port: 443,
						timeout,
						agent: keepAliveAgent,
						headers: {
							...headers,
							...(postDataIsBuffer ? {} : { "Content-Type": "application/json" })
						}
					},
					response => {
						if (response.statusCode !== 200) {
							resolve({
								status: response.statusCode ?? 500,
								statusText: "",
								data: null,
								headers,
								config: null as unknown as InternalAxiosRequestConfig
							})

							return
						}

						if (params.responseType === "stream") {
							resolve({
								status: 200,
								statusText: "",
								data: response,
								headers,
								config: null as unknown as InternalAxiosRequestConfig
							})
						} else {
							const chunks: Buffer[] = []

							response.on("data", chunk => {
								if (!response || !(chunk instanceof Buffer)) {
									return
								}

								chunks.push(chunk)
							})

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
										config: null as unknown as InternalAxiosRequestConfig
									})
								} catch (e) {
									reject(e)
								}
							})
						}

						response.on("error", reject)
					}
				)

				request.on("error", reject)
				request.on("timeout", () => reject(new Error(`Request timed out after ${timeout}ms`)))

				if (postDataIsBuffer) {
					const readableBuffer: Buffer | Uint8Array | ArrayBuffer = params.data as Buffer
					const progressStreamInstance = progressStream({
						length: readableBuffer.byteLength,
						time: 100
					})

					progressStreamInstance.on("progress", info => {
						if (!params.onUploadProgress || !info || typeof info.transferred !== "number") {
							return
						}

						let bytes = info.transferred

						if (lastBytesUploaded === 0) {
							lastBytesUploaded = info.transferred
						} else {
							bytes = Math.floor(info.transferred - lastBytesUploaded)
							lastBytesUploaded = info.transferred
						}

						params.onUploadProgress(bytes)
					})

					Readable.from([readableBuffer]).pipe(progressStreamInstance).pipe(request)
				} else {
					request.write(JSON.stringify(params.data))
					request.end()
				}
			})
		}

		return await axios.post(url + params.endpoint, params.data, {
			headers,
			signal: params.abortSignal,
			timeout: params.timeout ? params.timeout : APIClientDefaults.gatewayTimeout,
			responseType: params.responseType ? params.responseType : "json",
			maxRedirects: 0,
			maxBodyLength: Infinity,
			maxContentLength: Infinity,
			maxRate: Infinity,
			onUploadProgress: event => {
				if (!params.onUploadProgress || !event || typeof event.loaded !== "number") {
					return
				}

				let bytes = event.loaded

				if (lastBytesUploaded === 0) {
					lastBytesUploaded = event.loaded
				} else {
					bytes = Math.floor(event.loaded - lastBytesUploaded)
					lastBytesUploaded = event.loaded
				}

				params.onUploadProgress(bytes)
			}
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
		const headers = params.headers ? params.headers : this.buildHeaders({ apiKey: params.apiKey })

		if (params.apiKey && !headers["Authorization"]) {
			headers["Authorization"] = `Bearer ${params.apiKey}`
		}

		const url = params.url ? params.url : APIClientDefaults.gatewayURLs[getRandomArbitrary(0, APIClientDefaults.gatewayURLs.length - 1)]

		if (url.includes("egest.") || url.includes("down.")) {
			// No auth headers when requesting encrypted chunks.
			delete headers["Authorization"]
		}

		let lastBytesDownloaded = 0

		if (environment === "node") {
			return new Promise<AxiosResponse>((resolve, reject) => {
				const urlParsed = urlModule.parse(url, true)
				const timeout = params.timeout ? params.timeout : APIClientDefaults.gatewayTimeout

				const calculateProgress = (transferred: number) => {
					if (!params.onDownloadProgress) {
						return
					}

					let bytes = transferred

					if (lastBytesDownloaded === 0) {
						lastBytesDownloaded = transferred
					} else {
						bytes = Math.floor(transferred - lastBytesDownloaded)
						lastBytesDownloaded = transferred
					}

					params.onDownloadProgress(bytes)
				}

				const calculateProgressTransform = new Transform({
					transform(chunk, encoding, callback) {
						if (params.onDownloadProgress && chunk instanceof Buffer) {
							params.onDownloadProgress(chunk.byteLength)
						}

						this.push(chunk)

						callback()
					}
				})

				const request = https.request(
					{
						method: "GET",
						hostname: urlParsed.hostname,
						path: params.endpoint,
						port: 443,
						timeout,
						headers,
						agent: keepAliveAgent
					},
					response => {
						if (response.statusCode !== 200) {
							resolve({
								status: response.statusCode ?? 500,
								statusText: "",
								data: null,
								headers,
								config: null as unknown as InternalAxiosRequestConfig
							})

							return
						}

						if (params.responseType === "stream") {
							resolve({
								status: 200,
								statusText: "",
								data: response.pipe(calculateProgressTransform),
								headers,
								config: null as unknown as InternalAxiosRequestConfig
							})
						} else {
							const chunks: Buffer[] = []

							response.on("data", chunk => {
								if (!response || !(chunk instanceof Buffer)) {
									return
								}

								chunks.push(chunk)

								calculateProgress(chunk.byteLength)
							})

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
										config: null as unknown as InternalAxiosRequestConfig
									})
								} catch (e) {
									reject(e)
								}
							})
						}

						response.on("error", reject)
					}
				)

				request.on("error", reject)
				request.on("timeout", () => reject(new Error(`Request timed out after ${timeout}ms`)))

				request.end()
			})
		}

		return await axios.get(url + params.endpoint, {
			headers,
			signal: params.abortSignal,
			timeout: params.timeout ? params.timeout : APIClientDefaults.gatewayTimeout,
			responseType: params.responseType ? params.responseType : "json",
			maxRedirects: 0,
			maxBodyLength: Infinity,
			maxContentLength: Infinity,
			maxRate: Infinity,
			onDownloadProgress: event => {
				if (!params.onDownloadProgress || !event || typeof event.loaded !== "number") {
					return
				}

				let bytes = event.loaded

				if (lastBytesDownloaded === 0) {
					lastBytesDownloaded = event.loaded
				} else {
					bytes = Math.floor(event.loaded - lastBytesDownloaded)
					lastBytesDownloaded = event.loaded
				}

				params.onDownloadProgress(bytes)
			}
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

				throw new APIError({ code: "request_failed_after_max_tries", message: `Request failed after ${maxRetries} tries` })
			}

			tries += 1

			try {
				const response = params.method === "GET" ? await this.get(params) : await this.post(params)

				if (!response || response.status !== 200) {
					throw new APIError({ code: "invalid_http_status_code", message: `Invalid HTTP status code: ${response.status}` })
				}

				if (typeof response.data === "object" && typeof response.data.status === "boolean" && !response.data.status) {
					returnImmediately = true

					throw new APIError({ code: response.data.code, message: response.data.message })
				}

				return response.data &&
					(response.data.data || typeof response.data.data === "number" || typeof response.data.data === "string")
					? response.data.data
					: response.data
			} catch (e) {
				if (returnImmediately) {
					throw e
				}

				lastError = e

				await sleep(retryTimeout)

				return await send()
			}
		}

		await this._semaphores.request.acquire()

		try {
			return await send()
		} finally {
			this._semaphores.request.release()
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
	public async downloadChunkToLocal({
		uuid,
		bucket,
		region,
		chunk,
		to,
		timeout,
		abortSignal,
		maxRetries,
		retryTimeout,
		onProgress
	}: {
		uuid: string
		bucket: string
		region: string
		chunk: number
		to: string
		timeout?: number
		abortSignal?: AbortSignal
		maxRetries?: number
		retryTimeout?: number
		onProgress?: ProgressCallback
	}): Promise<void> {
		if (environment !== "node") {
			throw new Error("cloud.downloadChunkToLocal is only available in a Node.JS environment")
		}

		to = normalizePath(to)

		const response = await this.request<fs.ReadStream>({
			method: "GET",
			url: `${APIClientDefaults.egestURLs[getRandomArbitrary(0, APIClientDefaults.egestURLs.length - 1)]}`,
			endpoint: `/${region}/${bucket}/${uuid}/${chunk}`,
			abortSignal,
			timeout: timeout ? timeout : APIClientDefaults.egestTimeout,
			responseType: "stream",
			maxRetries,
			retryTimeout,
			onDownloadProgress: onProgress
		})

		await pipelineAsync(response, fs.createWriteStream(to))
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
	public async downloadChunkToStream({
		uuid,
		bucket,
		region,
		chunk,
		timeout,
		abortSignal,
		maxRetries,
		retryTimeout,
		onProgress
	}: {
		uuid: string
		bucket: string
		region: string
		chunk: number
		timeout?: number
		abortSignal?: AbortSignal
		maxRetries?: number
		retryTimeout?: number
		onProgress?: ProgressCallback
	}): Promise<ReadableStream | fs.ReadStream> {
		const response = await this.request<ReadableStream | fs.ReadStream>({
			method: "GET",
			url: `${APIClientDefaults.egestURLs[getRandomArbitrary(0, APIClientDefaults.egestURLs.length - 1)]}`,
			endpoint: `/${region}/${bucket}/${uuid}/${chunk}`,
			abortSignal,
			timeout: timeout ? timeout : APIClientDefaults.egestTimeout,
			responseType: "stream",
			maxRetries,
			retryTimeout,
			onDownloadProgress: onProgress
		})

		return response
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
	public async downloadChunkToBuffer({
		uuid,
		bucket,
		region,
		chunk,
		timeout,
		abortSignal,
		maxRetries,
		retryTimeout,
		onProgress
	}: {
		uuid: string
		bucket: string
		region: string
		chunk: number
		timeout?: number
		abortSignal?: AbortSignal
		maxRetries?: number
		retryTimeout?: number
		onProgress?: ProgressCallback
	}): Promise<Buffer> {
		const response = await this.request<ArrayBuffer>({
			method: "GET",
			url: `${APIClientDefaults.egestURLs[getRandomArbitrary(0, APIClientDefaults.egestURLs.length - 1)]}`,
			endpoint: `/${region}/${bucket}/${uuid}/${chunk}`,
			abortSignal,
			timeout: timeout ? timeout : APIClientDefaults.egestTimeout,
			responseType: "arraybuffer",
			maxRetries,
			retryTimeout,
			onDownloadProgress: onProgress
		})

		return Buffer.from(response)
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
	public async uploadChunkBuffer({
		uuid,
		index,
		parent,
		uploadKey,
		buffer,
		abortSignal,
		maxRetries,
		timeout,
		retryTimeout,
		onProgress
	}: {
		uuid: string
		index: number
		parent: string
		uploadKey: string
		buffer: Buffer
		timeout?: number
		abortSignal?: AbortSignal
		maxRetries?: number
		retryTimeout?: number
		onProgress?: ProgressCallback
	}): Promise<UploadChunkResponse> {
		const urlParams = new URLSearchParams({
			uuid,
			index,
			parent,
			uploadKey
		} as unknown as Record<string, string>).toString()

		const bufferHash = await bufferToHash({ buffer, algorithm: "sha512" })
		const fullURL = `${
			APIClientDefaults.ingestURLs[getRandomArbitrary(0, APIClientDefaults.ingestURLs.length - 1)]
		}/v3/upload?${urlParams}&hash=${bufferHash}`
		const parsedURLParams = parseURLParams({ url: fullURL })
		const urlParamsHash = await bufferToHash({ buffer: Buffer.from(JSON.stringify(parsedURLParams), "utf-8"), algorithm: "sha512" })
		const builtHeaders = this.buildHeaders({ apiKey: undefined })

		const response = await this.request<UploadChunkResponse>({
			method: "POST",
			url: `${APIClientDefaults.ingestURLs[getRandomArbitrary(0, APIClientDefaults.ingestURLs.length - 1)]}`,
			endpoint: `/v3/upload?${urlParams}&hash=${bufferHash}`,
			data: buffer,
			abortSignal,
			maxRetries,
			timeout: timeout ? timeout : APIClientDefaults.ingestTimeout,
			retryTimeout,
			headers: {
				...builtHeaders,
				Checksum: urlParamsHash
			},
			onUploadProgress: onProgress
		})

		return response
	}
}

export default APIClient
