import { environment, FILE_ENCRYPTION_VERSION, METADATA_ENCRYPTION_VERSION } from "../constants"
import nodeCrypto from "crypto"
import { type AuthVersion } from "../types"
import keyutil from "js-crypto-key-utils"
import cache from "../cache"
import { fastStringHash, nameSplitter } from "../utils"
import { argon2idAsync } from "@noble/hashes/argon2"
import { sha256 } from "@noble/hashes/sha256"
import CryptoAPI from "crypto-api-v1"
import { hmac } from "@noble/hashes/hmac"
import { hkdf } from "@noble/hashes/hkdf"

export const base64Charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
export const asciiCharset = Buffer.from(
	new Uint8Array(
		Array.from(
			{
				length: 128
			},
			(_, i) => i
		)
	)
).toString("utf-8")

export async function generateRandomString(length: number = 32): Promise<string> {
	if (environment === "node") {
		const array = nodeCrypto.randomBytes(length)

		return Array.from(array)
			.map(byte => base64Charset[byte % base64Charset.length])
			.join("")
	} else if (environment === "browser") {
		const array = new Uint8Array(length)

		globalThis.crypto.getRandomValues(array)

		return Array.from(array)
			.map(byte => base64Charset[byte % base64Charset.length])
			.join("")
	}

	throw new Error(`crypto.utils.generateRandomString not implemented for ${environment} environment`)
}

export async function generateRandomBytes(length: number = 32): Promise<Buffer> {
	if (environment === "node") {
		return nodeCrypto.randomBytes(length)
	} else if (environment === "browser") {
		const array = new Uint8Array(length)

		globalThis.crypto.getRandomValues(array)

		return Buffer.from(array)
	}

	throw new Error(`crypto.utils.generateRandomBytes not implemented for ${environment} environment`)
}

export async function generateRandomHexString(length: number = 32): Promise<string> {
	if (environment === "node") {
		return nodeCrypto.randomBytes(length).toString("hex")
	} else if (environment === "browser") {
		const array = new Uint8Array(length)

		globalThis.crypto.getRandomValues(array)

		return Buffer.from(array).toString("hex")
	}

	throw new Error(`crypto.utils.generateRandomHexString not implemented for ${environment} environment`)
}

export async function generateEncryptionKey(use: "file" | "metadata"): Promise<string> {
	if (use === "file") {
		if (FILE_ENCRYPTION_VERSION === 1 || FILE_ENCRYPTION_VERSION === 2) {
			return await generateRandomString(32)
		} else {
			return await generateRandomHexString(32)
		}
	} else {
		if (METADATA_ENCRYPTION_VERSION === 1 || METADATA_ENCRYPTION_VERSION === 2) {
			return await generateRandomString(32)
		} else {
			return await generateRandomHexString(32)
		}
	}
}

export async function hashFileName({
	name,
	authVersion,
	hmacKey
}: {
	name: string
	authVersion: AuthVersion
	hmacKey?: Buffer
}): Promise<string> {
	if (authVersion === 1 || authVersion === 2) {
		return await hashFn({
			input: name.toLowerCase()
		})
	} else {
		if (!hmacKey || hmacKey.byteLength !== 32) {
			throw new Error("hmacKey required for authVersion v3 salted file/directory name hash.")
		}

		return await hashSearchIndex({
			name,
			hmacKey
		})
	}
}

export async function hashSearchIndex({ name, hmacKey }: { name: string; hmacKey: Buffer }): Promise<string> {
	const nameBuffer = Buffer.from(name.toLowerCase(), "utf-8")

	if (environment === "browser") {
		return Buffer.from(hmac(sha256, hmacKey, nameBuffer)).toString("hex")
	} else {
		return nodeCrypto.createHmac("sha256", hmacKey).update(nameBuffer).digest("hex")
	}
}

export async function generateSearchIndexHashes({ input, hmacKey }: { input: string; hmacKey: Buffer }): Promise<string[]> {
	const parts = nameSplitter(input.toLowerCase())

	return await Promise.all(
		parts.map(part =>
			hashSearchIndex({
				name: part,
				hmacKey
			})
		)
	)
}

export async function generatePrivateKeyHMAC(privateKey: string): Promise<Buffer> {
	const privateKeyBuffer = Buffer.from(privateKey, "base64")

	if (environment === "browser") {
		return Buffer.from(hkdf(sha256, privateKeyBuffer, Buffer.from([]), Buffer.from("hmac-sha256-key", "utf-8"), 32))
	} else {
		return new Promise<Buffer>((resolve, reject) => {
			nodeCrypto.hkdf("sha256", privateKeyBuffer, Buffer.from([]), Buffer.from("hmac-sha256-key", "utf-8"), 32, (err, result) => {
				if (err) {
					reject(err)

					return
				}

				resolve(Buffer.from(result))
			})
		})
	}
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
}: DeriveKeyFromPasswordBase & {
	returnHex: false
}): Promise<Buffer>

export async function deriveKeyFromPassword({
	password,
	salt,
	iterations,
	hash,
	bitLength,
	returnHex
}: DeriveKeyFromPasswordBase & {
	returnHex: true
}): Promise<string>

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
 * @returns {Promise<string | Buffer>}
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
}): Promise<string | Buffer> {
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
				salt: Buffer.from(salt, "utf-8"),
				iterations: iterations,
				hash: {
					name: hash === "sha512" ? "SHA-512" : hash
				}
			},
			await importPBKDF2Key({
				key: password,
				mode: ["deriveBits"]
			}),
			bitLength
		)

		const key = returnHex ? Buffer.from(bits).toString("hex") : Buffer.from(bits)

		return key
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
			.update(nodeCrypto.createHash("sha512").update(Buffer.from(input, "utf-8")).digest("hex"))
			.digest("hex")
	} else if (environment === "browser") {
		return CryptoAPI.hash("sha1", CryptoAPI.hash("sha512", input))
	}

	throw new Error(`crypto.utils.hashFn not implemented for ${environment} environment`)
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
	if (environment === "browser" || environment === "node") {
		return (
			CryptoAPI.hash("sha512", CryptoAPI.hash("sha384", CryptoAPI.hash("sha256", CryptoAPI.hash("sha1", password)))) +
			CryptoAPI.hash("sha512", CryptoAPI.hash("md5", CryptoAPI.hash("md4", CryptoAPI.hash("md2", password))))
		)
	}

	throw new Error(`crypto.utils.hashPassword not implemented for ${environment} environment`)
}

/**
 * Generates/derives the password and master key based on the auth version. Auth Version 1 is deprecated and no longer in use. V2 uses PBKDF2, while V3 uses Argon2id.
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
		const derivedPassword = await hashPassword({
			password: rawPassword
		})
		const derivedMasterKeys = await hashFn({
			input: rawPassword
		})

		return {
			derivedMasterKeys,
			derivedPassword
		}
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
			derivedPassword = nodeCrypto.createHash("sha512").update(Buffer.from(derivedPassword, "utf-8")).digest("hex")
		} else if (environment === "browser") {
			derivedPassword = Buffer.from(await globalThis.crypto.subtle.digest("SHA-512", Buffer.from(derivedPassword, "utf-8"))).toString(
				"hex"
			)
		} else {
			throw new Error(`crypto.utils.generatePasswordAndMasterKeysBasedOnAuthVersion not implemented for ${environment} environment`)
		}

		return {
			derivedMasterKeys,
			derivedPassword
		}
	} else if (authVersion === 3) {
		const derived = Buffer.from(
			await argon2idAsync(rawPassword, salt, {
				t: 3,
				m: 65536,
				p: 4,
				version: 0x13,
				dkLen: 64
			})
		).toString("hex")

		const derivedMasterKeys = derived.substring(0, derived.length / 2)
		const derivedPassword = derived.substring(derived.length / 2, derived.length)

		return {
			derivedMasterKeys,
			derivedPassword
		}
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
 * @param {boolean} [param0.keyCache=true]
 * @returns {Promise<CryptoKey>}
 */
export async function importPublicKey({
	publicKey,
	mode = ["encrypt"],
	keyCache = true
}: {
	publicKey: string
	mode?: KeyUsage[]
	keyCache?: boolean
}): Promise<CryptoKey> {
	if (environment !== "browser") {
		throw new Error(`crypto.utils.importPublicKey not implemented for ${environment} environment`)
	}

	const cacheKey = fastStringHash(`${publicKey}:${mode.join(":")}`)

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

	if (keyCache) {
		cache.importPublicKey.set(cacheKey, importedPublicKey)
	}

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
 * @param {boolean} [param0.keyCache=true]
 * @returns {Promise<CryptoKey>}
 */
export async function importPrivateKey({
	privateKey,
	mode = ["encrypt"],
	keyCache = true
}: {
	privateKey: string
	mode?: KeyUsage[]
	keyCache?: boolean
}): Promise<CryptoKey> {
	if (environment !== "browser") {
		throw new Error(`crypto.utils.importPrivateKey not implemented for ${environment} environment`)
	}

	const cacheKey = fastStringHash(`${privateKey}:${mode.join(":")}`)

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

	if (keyCache) {
		cache.importPrivateKey.set(cacheKey, importedPrivateKey)
	}

	return importedPrivateKey
}

/**
 * Imports a raw key to WebCrypto's fromat.
 * @date 3/6/2024 - 11:13:40 PM
 *
 * @export
 * @async
 * @param {{
 * 	key: Buffer
 * 	algorithm: "AES-GCM" | "AES-CBC"
 * 	mode?: KeyUsage[]
 * 	keyCache?: boolean
 * }} param0
 * @param {Buffer} param0.key
 * @param {("AES-GCM" | "AES-CBC")} param0.algorithm
 * @param {{}} [param0.mode=["encrypt"]]
 * @param {boolean} [param0.keyCache=true]
 * @returns {Promise<CryptoKey>}
 */
export async function importRawKey({
	key,
	algorithm,
	mode = ["encrypt"],
	keyCache = true
}: {
	key: Buffer
	algorithm: "AES-GCM" | "AES-CBC"
	mode?: KeyUsage[]
	keyCache?: boolean
}): Promise<CryptoKey> {
	if (environment !== "browser") {
		throw new Error(`crypto.utils.importRawKey not implemented for ${environment} environment`)
	}

	const cacheKey = fastStringHash(`${key}:${algorithm}:${mode.join(":")}`)

	if (cache.importRawKey.has(cacheKey)) {
		return cache.importRawKey.get(cacheKey)!
	}

	const importedRawKey = await globalThis.crypto.subtle.importKey("raw", key, algorithm, false, mode)

	if (keyCache) {
		cache.importRawKey.set(cacheKey, importedRawKey)
	}

	return importedRawKey
}

/**
 * Imports a PBKDF2 key into WebCrypto's format.
 * @date 2/6/2024 - 8:56:57 PM
 *
 * @export
 * @async
 * @param {{ key: string; mode?: KeyUsage[], keyCache?: boolean }} param0
 * @param {string} param0.key
 * @param {{}} [param0.mode=["encrypt"]]
 * @param {boolean} [param0.keyCache=true]
 * @returns {Promise<CryptoKey>}
 */
export async function importPBKDF2Key({
	key,
	mode = ["encrypt"],
	keyCache = true
}: {
	key: string
	mode?: KeyUsage[]
	keyCache?: boolean
}): Promise<CryptoKey> {
	if (environment !== "browser") {
		throw new Error(`crypto.utils.importPBKDF2Key not implemented for ${environment} environment`)
	}

	const cacheKey = fastStringHash(`${key}:${mode.join(":")}`)

	if (cache.importPBKDF2Key.has(cacheKey)) {
		return cache.importPBKDF2Key.get(cacheKey)!
	}

	const importedPBKF2Key = await globalThis.crypto.subtle.importKey(
		"raw",
		Buffer.from(key, "utf-8"),
		{
			name: "PBKDF2"
		},
		false,
		mode
	)

	if (keyCache) {
		cache.importPBKDF2Key.set(cacheKey, importedPBKF2Key)
	}

	return importedPBKF2Key
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
	}

	throw new Error(`crypto.utils.generateKeyPair not implemented for ${environment} environment`)
}

/**
 * JS implementation of OpenSSL's EVP_BytesToKey. Depcrecated. NOT IN USE. Just here for backwards compatibility of another function.
 * @date 2/7/2024 - 1:00:21 AM
 *
 * @export
 * @param {{
 * 	password: Buffer
 * 	salt: Buffer
 * 	keyBits: number
 * 	ivLength: number
 * }} param0
 * @param {Buffer} param0.password
 * @param {Buffer} param0.salt
 * @param {number} param0.keyBits
 * @param {number} param0.ivLength
 * @returns {{ key: Buffer; iv: Buffer }}
 */
export function EVP_BytesToKey({
	password,
	salt,
	keyBits,
	ivLength
}: {
	password: Buffer
	salt: Buffer
	keyBits: number
	ivLength: number
}): { key: Buffer; iv: Buffer } {
	let keyLen = keyBits / 8
	const key = Buffer.alloc(keyLen)
	const iv = Buffer.alloc(ivLength || 0)
	let tmp = Buffer.alloc(0)

	while (keyLen > 0 || ivLength > 0) {
		const hash = nodeCrypto.createHash("md5")

		hash.update(tmp)
		hash.update(password)

		if (salt) {
			hash.update(salt)
		}

		tmp = hash.digest()

		let used = 0

		if (keyLen > 0) {
			const keyStart = key.length - keyLen

			used = Math.min(keyLen, tmp.length)

			tmp.copy(key, keyStart, 0, used)

			keyLen -= used
		}

		if (used < tmp.length && ivLength > 0) {
			const ivStart = iv.length - ivLength
			const length = Math.min(ivLength, tmp.length - used)

			tmp.copy(iv, ivStart, used, used + length)

			ivLength -= length
		}
	}

	tmp.fill(0)

	return {
		key,
		iv
	}
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
	generateKeyPair,
	importRawKey,
	importPBKDF2Key,
	generateRandomBytes,
	generateRandomHexString,
	hashFileName,
	hashSearchIndex,
	generateSearchIndexHashes,
	generatePrivateKeyHMAC,
	generateEncryptionKey
}

export default utils
