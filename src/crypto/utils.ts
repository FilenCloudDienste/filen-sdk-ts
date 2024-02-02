import { environment } from "../constants"
import nodeCrypto from "crypto"

const textEncoder = new TextEncoder()

/**
 * Generate a cryptographically secure random string of given length
 * @date 1/31/2024 - 4:01:20 PM
 *
 * @export
 * @param {{ length: number }} param0
 * @param {number} param0.length
 * @returns {string}
 */
export async function generateRandomString({ length }: { length: number }): Promise<string> {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

	if (environment === "node") {
		const randomBytes = nodeCrypto.randomBytes(length)
		const result = new Array(length)
		let cursor = 0

		for (let i = 0; i < length; i++) {
			cursor += randomBytes[i]
			result[i] = chars[cursor % chars.length]
		}

		return result.join("")
	} else if (environment === "browser") {
		const array = new Uint8Array(length)

		window.crypto.getRandomValues(array)

		const randomNumbers = Array.from(array).map(x => x % chars.length)

		return randomNumbers.map(x => chars[x]).join("")
	} else if (environment === "reactNative") {
		return await global.nodeThread.generateRandomString({ charLength: length })
	}

	throw new Error(`crypto.utils.generateRandomString not implemented for ${environment} environment`)
}

/**
 * Convert a buffer to base64
 * @date 1/31/2024 - 4:01:49 PM
 *
 * @export
 * @param {({ buffer: ArrayBuffer | Uint8Array | Buffer })} param0
 * @param {*} param0.buffer
 * @returns {string}
 */
export function bufferToBase64({ buffer }: { buffer: ArrayBuffer | Uint8Array | Buffer }): string {
	let base64 = ""
	const encodings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
	const bytes = new Uint8Array(buffer)
	const byteLength = bytes.byteLength
	const byteRemainder = byteLength % 3
	const mainLength = byteLength - byteRemainder
	let a, b, c, d
	let chunk

	for (let i = 0; i < mainLength; i = i + 3) {
		chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
		a = (chunk & 16515072) >> 18
		b = (chunk & 258048) >> 12
		c = (chunk & 4032) >> 6
		d = chunk & 63
		base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
	}

	if (byteRemainder === 1) {
		chunk = bytes[mainLength]
		a = (chunk & 252) >> 2
		b = (chunk & 3) << 4
		base64 += encodings[a] + encodings[b] + "=="
	} else if (byteRemainder === 2) {
		chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
		a = (chunk & 64512) >> 10
		b = (chunk & 1008) >> 4
		c = (chunk & 15) << 2
		base64 += encodings[a] + encodings[b] + encodings[c] + "="
	}

	return base64
}

/**
 * Convert a buffer to a hex string
 * @date 1/31/2024 - 4:03:03 PM
 *
 * @export
 * @param {({ buffer: ArrayBuffer | Uint8Array | Buffer })} param0
 * @param {*} param0.buffer
 * @returns {string}
 */
export function bufferToHex({ buffer }: { buffer: ArrayBuffer | Uint8Array | Buffer }): string {
	return new Uint8Array(buffer).reduce((a, b) => a + b.toString(16).padStart(2, "0"), "")
}

export type DeriveKeyFromPasswordBase = {
	password: string
	salt: string
	iterations: number
	hash: "sha512"
	bitLength: 256 | 512
}

export async function deriveKeyFromPassword({
	password,
	salt,
	iterations,
	hash,
	bitLength,
	returnHex
}: DeriveKeyFromPasswordBase & { returnHex: false }): Promise<Uint8Array>

export async function deriveKeyFromPassword({
	password,
	salt,
	iterations,
	hash,
	bitLength,
	returnHex
}: DeriveKeyFromPasswordBase & { returnHex: true }): Promise<string>

/**
 * Derive a key from given inputs using PBKDF2
 * @date 2/1/2024 - 6:14:25 PM
 *
 * @export
 * @async
 * @param {DeriveKeyFromPasswordBase & {
 * 	returnHex: boolean
 * }} param0
 * @param {string} param0.password
 * @param {string} param0.salt
 * @param {number} param0.iterations
 * @param {"sha512"} param0.hash
 * @param {(256 | 512)} param0.bitLength
 * @param {boolean} param0.returnHex
 * @returns {Promise<string | Uint8Array>}
 */
export async function deriveKeyFromPassword({
	password,
	salt,
	iterations,
	hash,
	bitLength,
	returnHex
}: DeriveKeyFromPasswordBase & {
	returnHex: boolean
}): Promise<string | Uint8Array> {
	if (environment === "node") {
		return await new Promise((resolve, reject) => {
			nodeCrypto.pbkdf2(password, salt, iterations, bitLength / 8, hash, (err, result) => {
				if (err) {
					reject(err)

					return
				}

				if (returnHex) {
					resolve(Buffer.from(result).toString("hex"))

					return
				}

				resolve(result)
			})
		})
	} else if (environment === "browser") {
		const bits = await globalThis.crypto.subtle.deriveBits(
			{
				name: "PBKDF2",
				salt: textEncoder.encode(salt),
				iterations: iterations,
				hash: {
					name: hash === "sha512" ? "SHA-512" : hash
				}
			},
			await globalThis.crypto.subtle.importKey(
				"raw",
				textEncoder.encode(password),
				{
					name: "PBKDF2"
				},
				false,
				["deriveBits"]
			),
			bitLength
		)

		const key = returnHex ? Buffer.from(bits).toString("hex") : new Uint8Array(bits)

		return key
	} else if (environment === "reactNative") {
		return await global.nodeThread.deriveKeyFromPassword({ password, salt, iterations, hash, bitLength, returnHex })
	}

	throw new Error(`crypto.utils.deriveKeyFromPassword not implemented for ${environment} environment`)
}

/**
 * Convert base64 to a buffer
 * @date 1/31/2024 - 4:04:21 PM
 *
 * @export
 * @param {string} base64
 * @returns {Uint8Array}
 */
export function base64ToBuffer(base64: string): Uint8Array {
	const binary_string = globalThis.atob(base64)
	const len = binary_string.length
	const bytes = new Uint8Array(len)

	for (let i = 0; i < len; i++) {
		bytes[i] = binary_string.charCodeAt(i)
	}

	return bytes
}

export async function hashFn(input: string): Promise<string> {
	if (environment === "node") {
		return nodeCrypto.createHash("sha1").update(nodeCrypto.createHash("sha512").update(input).digest("hex")).digest("hex")
	} else if (environment === "browser") {
		return Buffer.from(
			await globalThis.crypto.subtle.digest("SHA-1", await globalThis.crypto.subtle.digest("SHA-512", textEncoder.encode(input)))
		).toString("hex")
	} else if (environment === "reactNative") {
		return await global.nodeThread.hashFn({ string: input })
	}

	throw new Error(`crypto.utils.hashFn not implemented for ${environment} environment`)
}

export function normalizeHash(hash: string) {
	const lowercased = hash.toLowerCase()

	if (lowercased === "sha-512") {
		return "sha512"
	}

	if (lowercased === "sha-256") {
		return "sha256"
	}

	if (lowercased === "sha-384") {
		return "sha384"
	}

	if (lowercased === "sha-1") {
		return "sha1"
	}

	if (lowercased === "md-2") {
		return "md2"
	}

	if (lowercased === "md-4") {
		return "md4"
	}

	if (lowercased === "md-5") {
		return "md5"
	}

	return hash
}

export const utils = {
	generateRandomString,
	bufferToBase64,
	bufferToHex,
	deriveKeyFromPassword,
	base64ToBuffer,
	hashFn
}

export default utils
