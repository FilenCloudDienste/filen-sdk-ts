import { environment } from "../constants"
import nodeCrypto from "crypto"
import CryptoAPI from "crypto-api-v1"
import type { AuthVersion } from "../types"
import keyutil from "js-crypto-key-utils"
import cache from "../cache"

const textEncoder = new TextEncoder()

/**
 * Generate a cryptographically secure random string of given length.
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
 * Derive a key from given inputs using PBKDF2.
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
 * Hashes an input (mostly file/folder names).
 * @date 2/2/2024 - 6:59:32 PM
 *
 * @export
 * @async
 * @param {{input: string}} param0
 * @param {string} param0.input
 * @returns {Promise<string>}
 */
export async function hashFn({ input }: { input: string }): Promise<string> {
	if (environment === "node") {
		return nodeCrypto
			.createHash("sha1")
			.update(nodeCrypto.createHash("sha512").update(textEncoder.encode(input)).digest("hex"))
			.digest("hex")
	} else if (environment === "browser") {
		return Buffer.from(
			await globalThis.crypto.subtle.digest("SHA-1", await globalThis.crypto.subtle.digest("SHA-512", textEncoder.encode(input)))
		).toString("hex")
	} else if (environment === "reactNative") {
		return await global.nodeThread.hashFn({ string: input })
	}

	throw new Error(`crypto.utils.hashFn not implemented for ${environment} environment`)
}

/**
 * Normalize hash names. E.g. WebCrypto uses "SHA-512" while Node.JS's Crypto Core lib uses "sha512".
 * @date 2/2/2024 - 6:59:42 PM
 *
 * @export
 * @param {{hash: string}} param0
 * @param {string} param0.hash
 * @returns {string}
 */
export function normalizeHash({ hash }: { hash: string }): string {
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

/**
 * Old V1 authentication password hashing. DEPRECATED AND NOT IN USE, JUST HERE FOR BACKWARDS COMPATIBILITY.
 * @date 2/2/2024 - 6:59:54 PM
 *
 * @export
 * @async
 * @param {{password: string}} param0
 * @param {string} param0.password
 * @returns {Promise<string>}
 */
export async function hashPassword({ password }: { password: string }): Promise<string> {
	if (environment === "node") {
		const passwordBuffer = textEncoder.encode(password)

		return (
			nodeCrypto
				.createHash("sha512")
				.update(
					nodeCrypto
						.createHash("sha384")
						.update(nodeCrypto.createHash("sha256").update(passwordBuffer).digest("hex"))
						.digest("hex")
				)
				.digest("hex") +
			nodeCrypto
				.createHash("sha512")
				.update(
					nodeCrypto.createHash("md5").update(nodeCrypto.createHash("md4").update(passwordBuffer).digest("hex")).digest("hex")
				)
				.digest("hex")
		)
	} else if (environment === "browser") {
		return (
			CryptoAPI.hash("sha512", CryptoAPI.hash("sha384", CryptoAPI.hash("sha256", CryptoAPI.hash("sha1", password)))) +
			CryptoAPI.hash("sha512", CryptoAPI.hash("md5", CryptoAPI.hash("md4", CryptoAPI.hash("md2", password))))
		)
	} else if (environment === "reactNative") {
		return await global.nodeThread.hashPassword({ password })
	}

	throw new Error(`crypto.utils.hashPassword not implemented for ${environment} environment`)
}

/**
 * Generates/derives the password and master key based on the auth version. Auth Version 1 is deprecated and no longer in use.
 * @date 2/2/2024 - 6:16:04 PM
 *
 * @export
 * @async
 * @param {{rawPassword: string, authVersion: AuthVersion, salt: string}} param0
 * @param {string} param0.rawPassword
 * @param {AuthVersion} param0.authVersion
 * @param {string} param0.salt
 * @returns {Promise<{ derivedMasterKeys: string; derivedPassword: string }>}
 */
export async function generatePasswordAndMasterKeyBasedOnAuthVersion({
	rawPassword,
	authVersion,
	salt
}: {
	rawPassword: string
	authVersion: AuthVersion
	salt: string
}): Promise<{ derivedMasterKeys: string; derivedPassword: string }> {
	if (authVersion === 1) {
		// DEPRECATED AND NOT IN USE, JUST HERE FOR BACKWARDS COMPATIBILITY.
		const derivedPassword = await hashPassword({ password: rawPassword })
		const derivedMasterKeys = await hashFn({ input: rawPassword })

		return { derivedMasterKeys, derivedPassword }
	} else if (authVersion === 2) {
		const derivedKey = await deriveKeyFromPassword({
			password: rawPassword,
			salt,
			iterations: 200000,
			hash: "sha512",
			bitLength: 512,
			returnHex: true
		})
		let derivedPassword = derivedKey.substring(derivedKey.length / 2, derivedKey.length)
		const derivedMasterKeys = derivedKey.substring(0, derivedKey.length / 2)

		if (environment === "node") {
			derivedPassword = nodeCrypto.createHash("sha512").update(textEncoder.encode(derivedPassword)).digest("hex")
		} else if (environment === "browser") {
			derivedPassword = Buffer.from(await globalThis.crypto.subtle.digest("SHA-512", textEncoder.encode(derivedPassword))).toString(
				"hex"
			)
		} else if (environment === "reactNative") {
			derivedPassword = CryptoAPI.hash("sha512", derivedPassword)
		} else {
			throw new Error(`crypto.utils.generatePasswordAndMasterKeysBasedOnAuthVersion not implemented for ${environment} environment`)
		}

		return { derivedMasterKeys, derivedPassword }
	} else {
		throw new Error(`Invalid authVersion: ${authVersion}`)
	}
}

/**
 * Converts a public/private key in DER format to PEM.
 * @date 2/2/2024 - 7:00:12 PM
 *
 * @export
 * @async
 * @param {{key: string}} param0
 * @param {string} param0.key
 * @returns {Promise<string>}
 */
export async function derKeyToPem({ key }: { key: string }): Promise<string> {
	const importedKey = new keyutil.Key("der", Buffer.from(key, "base64"))

	return (await importedKey.export("pem")).toString()
}

/**
 * Imports a base64 encoded SPKI public key to WebCrypto's format.
 * @date 2/2/2024 - 7:04:12 PM
 *
 * @export
 * @async
 * @param {{ publicKey: string; mode?: KeyUsage[] }} param0
 * @param {string} param0.publicKey
 * @param {{}} [param0.mode=["encrypt"]]
 * @returns {Promise<CryptoKey>}
 */
export async function importPublicKey({ publicKey, mode = ["encrypt"] }: { publicKey: string; mode?: KeyUsage[] }): Promise<CryptoKey> {
	if (environment !== "browser") {
		throw new Error(`crypto.utils.importPublicKey not implemented for ${environment} environment`)
	}

	const cacheKey = `${publicKey}:${mode.join(":")}`

	if (cache.importPublicKey.has(cacheKey)) {
		return cache.importPublicKey.get(cacheKey)!
	}

	const importedPublicKey = await globalThis.crypto.subtle.importKey(
		"spki",
		Buffer.from(publicKey, "base64"),
		{
			name: "RSA-OAEP",
			hash: "SHA-512"
		},
		true,
		mode
	)

	cache.importPublicKey.set(cacheKey, importedPublicKey)

	return importedPublicKey
}

/**
 * Imports a base64 PCS8 private key to WebCrypto's format.
 * @date 2/3/2024 - 1:44:39 AM
 *
 * @export
 * @async
 * @param {{ privateKey: string; mode?: KeyUsage[] }} param0
 * @param {string} param0.privateKey
 * @param {{}} [param0.mode=["encrypt"]]
 * @returns {Promise<CryptoKey>}
 */
export async function importPrivateKey({ privateKey, mode = ["encrypt"] }: { privateKey: string; mode?: KeyUsage[] }): Promise<CryptoKey> {
	if (environment !== "browser") {
		throw new Error(`crypto.utils.importPublicKey not implemented for ${environment} environment`)
	}

	const cacheKey = `${privateKey}:${mode.join(":")}`

	if (cache.importPrivateKey.has(cacheKey)) {
		return cache.importPrivateKey.get(cacheKey)!
	}

	const importedPrivateKey = await globalThis.crypto.subtle.importKey(
		"pkcs8",
		Buffer.from(privateKey, "base64"),
		{
			name: "RSA-OAEP",
			hash: "SHA-512"
		},
		true,
		mode
	)

	cache.importPrivateKey.set(cacheKey, importedPrivateKey)

	return importedPrivateKey
}

/**
 * Generates the hash hex digest of a Buffer/Uint8Array.
 * @date 2/3/2024 - 2:03:24 AM
 *
 * @export
 * @async
 * @param {({buffer: Uint8Array, algorithm: "sha256" | "sha512" | "md5"})} param0
 * @param {Uint8Array} param0.buffer
 * @param {("sha256" | "sha512" | "md5")} param0.algorithm
 * @returns {Promise<string>}
 */
export async function bufferToHash({ buffer, algorithm }: { buffer: Uint8Array; algorithm: "sha256" | "sha512" | "md5" }): Promise<string> {
	if (environment === "node") {
		return nodeCrypto.createHash(algorithm).update(buffer).digest("hex")
	} else if (environment === "browser") {
		const webcryptoAlgorithm = algorithm === "sha512" ? "SHA-512" : algorithm === "sha256" ? "SHA-256" : "MD-5"
		const digest = await globalThis.crypto.subtle.digest(webcryptoAlgorithm, buffer)

		return Buffer.from(digest).toString("hex")
	}

	throw new Error(`crypto.utils.bufferToHash not implemented for ${environment} environment`)
}

/**
 * Generate an asymmetric public/private keypair.
 * @date 2/6/2024 - 3:24:43 AM
 *
 * @export
 * @async
 * @returns {Promise<{ publicKey: string; privateKey: string }>}
 */
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
	if (environment === "node") {
		return await new Promise((resolve, reject) => {
			nodeCrypto.generateKeyPair(
				"rsa",
				{
					modulusLength: 4096,
					publicKeyEncoding: {
						type: "spki",
						format: "der"
					},
					privateKeyEncoding: {
						type: "pkcs8",
						format: "der"
					},
					publicExponent: 0x10001
				},
				(err, publicKey, privateKey) => {
					if (err) {
						reject(err)

						return
					}

					resolve({
						publicKey: publicKey.toString("base64"),
						privateKey: privateKey.toString("base64")
					})
				}
			)
		})
	} else if (environment === "browser") {
		const keyPair = await globalThis.crypto.subtle.generateKey(
			{
				name: "RSA-OAEP",
				modulusLength: 4096,
				publicExponent: new Uint8Array([1, 0, 1]),
				hash: "SHA-512"
			},
			true,
			["encrypt", "decrypt"]
		)

		const publicKey = await globalThis.crypto.subtle.exportKey("spki", keyPair.publicKey)
		const privateKey = await globalThis.crypto.subtle.exportKey("pkcs8", keyPair.privateKey)

		return {
			publicKey: Buffer.from(publicKey).toString("base64"),
			privateKey: Buffer.from(privateKey).toString("base64")
		}
	} else if (environment === "reactNative") {
		return await global.nodeThread.generateKeypair()
	}

	throw new Error(`crypto.utils.generateKeyPair not implemented for ${environment} environment`)
}

export const utils = {
	generateRandomString,
	deriveKeyFromPassword,
	hashFn,
	generatePasswordAndMasterKeyBasedOnAuthVersion,
	hashPassword,
	derKeyToPem,
	importPublicKey,
	importPrivateKey,
	bufferToHash,
	generateKeyPair
}

export default utils
