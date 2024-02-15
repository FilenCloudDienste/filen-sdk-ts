import pathModule from "path"
import { v4 as _uuidv4 } from "uuid"
import { environment } from "./constants"
import nodeCrypto from "crypto"

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

	if (environment === "reactNative") {
		return await global.nodeThread.uuidv4()
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
export async function promiseAllChunked<T>(promises: Promise<T>[], chunkSize = 100000): Promise<T[]> {
	const results: T[] = []

	for (let i = 0; i < promises.length; i += chunkSize) {
		const chunkResults = await Promise.all(promises.slice(i, i + chunkSize))

		results.push(...chunkResults)
	}

	return results
}

export function getRandomArbitrary(min: number, max: number) {
	return Math.floor(Math.random() * (max - min) + min)
}

export const utils = {
	sleep,
	convertTimestampToMs,
	normalizePath,
	uuidv4,
	Uint8ArrayConcat,
	promiseAllChunked,
	getRandomArbitrary
}

export default utils
