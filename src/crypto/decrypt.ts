import { environment } from "../constants"
import type { CryptoConfig } from "."
import { deriveKeyFromPassword, importPrivateKey, derKeyToPem } from "./utils"
import CryptoJS from "crypto-js"
import nodeCrypto from "crypto"
import type { FileMetadata, FolderMetadata } from "../types"
import { convertTimestampToMs } from "../utils"
import cache from "../cache"

/**
 * Decrypt
 * @date 1/31/2024 - 6:36:57 PM
 *
 * @export
 * @class Decrypt
 * @typedef {Decrypt}
 */
export class Decrypt {
	private readonly config: CryptoConfig
	private readonly textEncoder = new TextEncoder()
	private readonly textDecoder = new TextDecoder()

	/**
	 * Creates an instance of Decrypt.
	 * @date 1/31/2024 - 3:59:10 PM
	 *
	 * @constructor
	 * @public
	 * @param {CryptoConfig} params
	 */
	public constructor(params: CryptoConfig) {
		this.config = params
	}

	/**
	 * Decrypt a string with the given key.
	 * @date 1/31/2024 - 3:58:27 PM
	 *
	 * @public
	 * @async
	 * @param {{ data: string; key: string }} param0
	 * @param {string} param0.data
	 * @param {string} param0.key
	 * @returns {Promise<string>}
	 */
	public async metadata({ metadata, key }: { metadata: string; key: string }): Promise<string> {
		const sliced = metadata.slice(0, 8)

		if (sliced === "U2FsdGVk") {
			// Old and deprecated, not in use anymore, just here for backwards compatibility
			return CryptoJS.AES.decrypt(metadata, key).toString(CryptoJS.enc.Utf8)
		} else {
			const version = metadata.slice(0, 3)

			if (version === "002") {
				const iv = metadata.slice(3, 15)
				const keyBuffer = (await deriveKeyFromPassword({
					password: key,
					salt: key,
					iterations: 1,
					hash: "sha512",
					bitLength: 256,
					returnHex: false
				})) as Uint8Array
				const ivBuffer = this.textEncoder.encode(iv)
				const cipherText = metadata.slice(15)
				const encrypted = Buffer.from(cipherText, "base64")

				if (environment === "node") {
					const authTag = encrypted.slice(encrypted.byteLength - ((128 + 7) >> 3))
					const ciphertext = encrypted.slice(0, encrypted.byteLength - authTag.byteLength)
					const decipher = nodeCrypto.createDecipheriv("aes-256-gcm", keyBuffer, ivBuffer)

					decipher.setAuthTag(authTag)

					const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])

					return this.textDecoder.decode(decrypted)
				} else if (environment === "browser") {
					const decrypted = await globalThis.crypto.subtle.decrypt(
						{
							name: "AES-GCM",
							iv: ivBuffer
						},
						await globalThis.crypto.subtle.importKey("raw", keyBuffer, "AES-GCM", false, ["decrypt"]),
						encrypted
					)

					return this.textDecoder.decode(decrypted)
				} else if (environment === "reactNative") {
					return await global.nodeThread.decryptMetadata({ data: metadata, key })
				}

				throw new Error(`crypto.decrypt.metadata not implemented for ${environment} environment`)
			}

			throw new Error(`[crypto.decrypt.metadata] Invalid metadata version ${version}`)
		}
	}

	/**
	 * Decrypt metadata using the given private key.
	 * @date 2/3/2024 - 1:50:10 AM
	 *
	 * @public
	 * @async
	 * @param {{ metadata: string; privateKey: string }} param0
	 * @param {string} param0.metadata
	 * @param {string} param0.privateKey
	 * @returns {Promise<string>}
	 */
	public async metadataPrivate({ metadata, privateKey }: { metadata: string; privateKey: string }): Promise<string> {
		if (environment === "node") {
			const pemKey = await derKeyToPem({ key: privateKey })
			const decrypted = nodeCrypto.privateDecrypt(
				{
					key: pemKey,
					padding: nodeCrypto.constants.RSA_PKCS1_OAEP_PADDING,
					oaepHash: "sha512"
				},
				Buffer.from(metadata, "base64")
			)

			return decrypted.toString("utf-8")
		} else if (environment === "browser") {
			const importedPrivateKey = await importPrivateKey({ privateKey, mode: ["decrypt"] })
			const decrypted = await globalThis.crypto.subtle.decrypt(
				{
					name: "RSA-OAEP"
				},
				importedPrivateKey,
				Buffer.from(metadata, "base64")
			)

			return this.textDecoder.decode(decrypted)
		} else if (environment === "reactNative") {
			return await global.nodeThread.decryptMetadataPrivateKey({ data: metadata, privateKey })
		}

		throw new Error(`crypto.encrypt.metadataPrivate not implemented for ${environment} environment`)
	}

	/**
	 * Decrypt file metadata.
	 * @date 2/3/2024 - 1:54:51 AM
	 *
	 * @public
	 * @async
	 * @param {{ metadata: string, key?: string }} param0
	 * @param {string} param0.metadata
	 * @param {string} param0.key
	 * @returns {Promise<FileMetadata>}
	 */
	public async fileMetadata({ metadata, key }: { metadata: string; key?: string }): Promise<FileMetadata> {
		if (this.config.metadataCache && cache.fileMetadata.has(metadata)) {
			return cache.fileMetadata.get(metadata)!
		}

		let fileMetadata: FileMetadata = {
			name: "",
			size: 0,
			mime: "application/octet-stream",
			key: "",
			lastModified: Date.now(),
			creation: undefined,
			hash: undefined
		}

		const keysToUse = key ? [key] : this.config.masterKeys.reverse()

		for (const masterKey of keysToUse) {
			try {
				const decrypted = JSON.parse(await this.metadata({ metadata, key: masterKey }))

				if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
					fileMetadata = {
						...decrypted,
						size: parseInt(decrypted.size ?? 0),
						lastModified: convertTimestampToMs(parseInt(decrypted.lastModified ?? Date.now())),
						creation: typeof decrypted.creation === "number" ? convertTimestampToMs(parseInt(decrypted.creation)) : undefined
					}

					if (this.config.metadataCache) {
						cache.fileMetadata.set(metadata, fileMetadata)
					}

					break
				}
			} catch {
				continue
			}
		}

		if (fileMetadata.name.length === 0) {
			throw new Error("Could not decrypt file metadata using master keys.")
		}

		return fileMetadata
	}

	/**
	 * Decrypt folder metadata.
	 * @date 2/3/2024 - 1:55:17 AM
	 *
	 * @public
	 * @async
	 * @param {{ metadata: string, key?: string }} param0
	 * @param {string} param0.metadata
	 * @param {string} param0.key
	 * @returns {Promise<FolderMetadata>}
	 */
	public async folderMetadata({ metadata, key }: { metadata: string; key?: string }): Promise<FolderMetadata> {
		if (this.config.metadataCache && cache.folderMetadata.has(metadata)) {
			return cache.folderMetadata.get(metadata)!
		}

		let folderMetadata: FolderMetadata = {
			name: ""
		}

		const keysToUse = key ? [key] : this.config.masterKeys.reverse()

		for (const masterKey of keysToUse) {
			try {
				const decrypted = JSON.parse(await this.metadata({ metadata, key: masterKey }))

				if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
					folderMetadata = {
						...folderMetadata,
						name: decrypted.name
					}

					if (this.config.metadataCache) {
						cache.folderMetadata.set(metadata, folderMetadata)
					}

					break
				}
			} catch {
				continue
			}
		}

		if (folderMetadata.name.length === 0) {
			throw new Error("Could not decrypt folder metadata using master keys.")
		}

		return folderMetadata
	}

	/**
	 * Decrypt file metadata using a private key.
	 * @date 2/3/2024 - 1:58:12 AM
	 *
	 * @public
	 * @async
	 * @param {{ metadata: string; key?: string }} param0
	 * @param {string} param0.metadata
	 * @param {string} param0.key
	 * @returns {Promise<FileMetadata>}
	 */
	public async fileMetadataPrivate({ metadata, key }: { metadata: string; key?: string }): Promise<FileMetadata> {
		if (this.config.metadataCache && cache.fileMetadata.has(metadata)) {
			return cache.fileMetadata.get(metadata)!
		}

		let fileMetadata: FileMetadata = {
			name: "",
			size: 0,
			mime: "application/octet-stream",
			key: "",
			lastModified: Date.now(),
			creation: undefined,
			hash: undefined
		}

		const privateKey = key ? key : this.config.privateKey
		const decrypted = JSON.parse(await this.metadataPrivate({ metadata, privateKey }))

		if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
			fileMetadata = {
				...decrypted,
				size: parseInt(decrypted.size ?? 0),
				lastModified: convertTimestampToMs(parseInt(decrypted.lastModified ?? Date.now())),
				creation: typeof decrypted.creation === "number" ? convertTimestampToMs(parseInt(decrypted.creation)) : undefined
			}

			if (this.config.metadataCache) {
				cache.fileMetadata.set(metadata, fileMetadata)
			}
		}

		if (fileMetadata.name.length === 0) {
			throw new Error("Could not decrypt file metadata using private key.")
		}

		return fileMetadata
	}

	/**
	 * Decrypt folder metadata using a private key.
	 * @date 2/3/2024 - 1:58:05 AM
	 *
	 * @public
	 * @async
	 * @param {{ metadata: string; key?: string }} param0
	 * @param {string} param0.metadata
	 * @param {string} param0.key
	 * @returns {Promise<FolderMetadata>}
	 */
	public async folderMetadataPrivate({ metadata, key }: { metadata: string; key?: string }): Promise<FolderMetadata> {
		if (this.config.metadataCache && cache.folderMetadata.has(metadata)) {
			return cache.folderMetadata.get(metadata)!
		}

		let folderMetadata: FolderMetadata = {
			name: ""
		}

		const privateKey = key ? key : this.config.privateKey
		const decrypted = JSON.parse(await this.metadataPrivate({ metadata, privateKey }))

		if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
			folderMetadata = {
				...folderMetadata,
				name: decrypted.name
			}

			if (this.config.metadataCache) {
				cache.folderMetadata.set(metadata, folderMetadata)
			}
		}

		if (folderMetadata.name.length === 0) {
			throw new Error("Could not decrypt folder metadata using private key.")
		}

		return folderMetadata
	}
}

export default Decrypt
