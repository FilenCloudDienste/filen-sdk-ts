import pathModule from "path"

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

export const utils = {
	sleep,
	convertTimestampToMs,
	normalizePath
}

export default utils
