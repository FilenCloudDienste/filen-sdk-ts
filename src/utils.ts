import pathModule from "path"
import { v4 as _uuidv4 } from "uuid"
import { environment } from "./constants"
import nodeCrypto from "crypto"
import os from "os"
import fs from "fs-extra"
import { xxHash32 } from "js-xxhash"
import { type FileMetadata } from "./types"
import { type Readable } from "stream"

/**
 * "Sleep" for given milliseconds.
 * @date 1/31/2024 - 4:27:48 PM
 *
 * @export
 * @async
 * @param {number} ms
 * @returns {Promise<void>}
 */
export async function sleep(ms: number): Promise<void> {
	await new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Convert a UNIX style timestamp (in seconds) to milliseconds
 * @date 1/31/2024 - 4:10:35 PM
 *
 * @export
 * @param {number} timestamp
 * @returns {number}
 */
export function convertTimestampToMs(timestamp: number): number {
	const now = Date.now()

	if (Math.abs(now - timestamp) < Math.abs(now - timestamp * 1000)) {
		return timestamp
	}

	return Math.floor(timestamp * 1000)
}

/**
 * Normalizes a path to UNIX/Windows standards.
 * @date 2/5/2024 - 9:13:01 PM
 *
 * @export
 * @param {string} path
 * @returns {string}
 */
export function normalizePath(path: string): string {
	return pathModule.normalize(path.split("file://").join("").split("file:/").join("").split("file:").join(""))
}

/**
 * Generates a V4 UUID.
 * @date 2/6/2024 - 9:22:54 PM
 *
 * @export
 * @async
 * @returns {Promise<string>}
 */
export async function uuidv4(): Promise<string> {
	if (environment === "node") {
		return nodeCrypto.randomUUID()
	}

	return _uuidv4()
}

/**
 * Concat two Uint8Arrays.
 * @date 2/7/2024 - 5:13:31 AM
 *
 * @export
 * @param {Uint8Array} a1
 * @param {Uint8Array} a2
 * @returns {Uint8Array}
 */
export function Uint8ArrayConcat(a1: Uint8Array, a2: Uint8Array): Uint8Array {
	const mergedArray = new Uint8Array(a1.length + a2.length)

	mergedArray.set(a1)
	mergedArray.set(a2, a1.length)

	return mergedArray
}

/**
 * Chunk large Promise.all executions.
 * @date 2/14/2024 - 11:59:34 PM
 *
 * @export
 * @async
 * @template T
 * @param {Promise<T>[]} promises
 * @param {number} [chunkSize=10000]
 * @returns {Promise<T[]>}
 */
export async function promiseAllChunked<T>(promises: Promise<T>[], chunkSize = 10000): Promise<T[]> {
	const results: T[] = []

	for (let i = 0; i < promises.length; i += chunkSize) {
		const chunkResults = await Promise.all(promises.slice(i, i + chunkSize))

		results.push(...chunkResults)
	}

	return results
}

/**
 * Chunk large Promise.allSettled executions.
 * @date 3/5/2024 - 12:41:08 PM
 *
 * @export
 * @async
 * @template T
 * @param {Promise<T>[]} promises
 * @param {number} [chunkSize=10000]
 * @returns {Promise<T[]>}
 */
export async function promiseAllSettledChunked<T>(promises: Promise<T>[], chunkSize = 10000): Promise<T[]> {
	const results: T[] = []

	for (let i = 0; i < promises.length; i += chunkSize) {
		const chunkPromisesSettled = await Promise.allSettled(promises.slice(i, i + chunkSize))
		const chunkResults = chunkPromisesSettled.reduce((acc: T[], current) => {
			if (current.status === "fulfilled") {
				acc.push(current.value)
			} else {
				// Handle rejected promises or do something with the error (current.reason)
			}

			return acc
		}, [])

		results.push(...chunkResults)
	}

	return results
}

/**
 * Generate a random number. NOT CRYPTOGRAPHICALLY SAFE.
 * @date 2/17/2024 - 1:08:06 AM
 *
 * @export
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function getRandomArbitrary(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min) + min)
}

/**
 * Clear the temporary directory.
 * @date 2/17/2024 - 1:15:42 AM
 *
 * @export
 * @async
 * @param {{ tmpDir?: string }} param0
 * @param {string} param0.tmpDir
 * @returns {Promise<void>}
 */
export async function clearTempDirectory({ tmpDir }: { tmpDir?: string }): Promise<void> {
	if (environment !== "node") {
		return
	}

	tmpDir = normalizePath(tmpDir ? tmpDir : pathModule.join(os.tmpdir(), "filen-sdk"))

	await fs.rm(tmpDir, {
		force: true,
		maxRetries: 60 * 10,
		recursive: true,
		retryDelay: 100
	})

	await fs.mkdir(tmpDir, {
		recursive: true
	})
}

/**
 * Parse URL parameters.
 * @date 2/17/2024 - 4:57:54 AM
 *
 * @export
 * @param {{url: string}} param0
 * @param {string} param0.url
 * @returns {Record<string, string>}
 */
export function parseURLParams({ url }: { url: string }): Record<string, string> {
	const urlParams = new URLSearchParams(new URL(url).search)
	const params: Record<string, string> = {}

	urlParams.forEach((value, key) => {
		params[key] = value
	})

	return params
}

/**
 * Extract every possible directory path from a path.
 * @date 2/19/2024 - 6:02:06 AM
 *
 * @export
 * @param {string} path
 * @returns {string[]}
 */
export function getEveryPossibleDirectoryPath(path: string): string[] {
	const ex = path.split("/")

	if (ex.length <= 1) {
		return [path]
	}

	const paths: string[] = []

	for (let i = 0; i < ex.length; i++) {
		const toJoin = []

		for (let x = 0; x < i + 1; x++) {
			toJoin.push(ex[x])
		}

		paths.push(toJoin.join("/"))
	}

	if (paths.length <= 0) {
		return [path]
	}

	return paths
}

/**
 * Convert a timestamp in ms to a simple date format
 * @date 2/19/2024 - 11:48:39 PM
 *
 * @export
 * @param {number} timestamp
 * @returns {string}
 */
export function simpleDate(timestamp: number): string {
	try {
		return new Date(convertTimestampToMs(timestamp)).toString().split(" ").slice(0, 5).join(" ")
	} catch (e) {
		return new Date().toString().split(" ").slice(0, 5).join(" ")
	}
}

/**
 * Replace a path with it's new parent path.
 *
 * @export
 * @param {string} path
 * @param {string} from
 * @param {string} to
 * @returns {string}
 */
export function replacePathStartWithFromAndTo(path: string, from: string, to: string): string {
	if (path.endsWith("/")) {
		path = path.slice(0, path.length - 1)
	}

	if (from.endsWith("/")) {
		from = from.slice(0, from.length - 1)
	}

	if (to.endsWith("/")) {
		to = to.slice(0, to.length - 1)
	}

	if (!path.startsWith("/")) {
		path = `/${path}`
	}

	if (!from.startsWith("/")) {
		from = `/${from}`
	}

	if (!to.startsWith("/")) {
		to = `/${to}`
	}

	return `${to}${path.slice(from.length)}`
}

export function fastStringHash(input: string): string {
	return input.substring(0, 8) + xxHash32(input, 0).toString(16) + input.substring(input.length - 8, input.length)
}

export function realFileSize({ chunksSize, metadataDecrypted }: { chunksSize?: number; metadataDecrypted: FileMetadata }): number {
	return metadataDecrypted.name.length > 0 ? metadataDecrypted.size : typeof chunksSize === "number" && chunksSize > 0 ? chunksSize : 1
}

export async function nodeStreamToBuffer(stream: Readable): Promise<Buffer> {
	const chunks: Buffer[] = []

	for await (const chunk of stream) {
		chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
	}

	return Buffer.concat(chunks)
}

export const utils = {
	sleep,
	convertTimestampToMs,
	normalizePath,
	uuidv4,
	Uint8ArrayConcat,
	promiseAllChunked,
	getRandomArbitrary,
	clearTempDirectory,
	parseURLParams,
	getEveryPossibleDirectoryPath,
	simpleDate,
	replacePathStartWithFromAndTo,
	fastStringHash,
	nodeStreamToBuffer
}

export default utils
