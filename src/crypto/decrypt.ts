import { environment } from "../constants"
import type { CryptoConfig } from "."
import { deriveKeyFromPassword } from "./utils"
import CryptoJS from "crypto-js"
import nodeCrypto from "crypto"
import type { FileMetadata, FolderMetadata } from "../types"
import { convertTimestampToMs } from "../utils"

/**
 * Decrypt
 * @date 1/31/2024 - 6:36:57 PM
 *
 * @export
 * @class Decrypt
 * @typedef {Decrypt}
 */
export default class Decrypt {
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
				}

				throw new Error(`crypto.decrypt.metadata not implemented for ${environment} environment`)
			}

			throw new Error(`[crypto.decrypt.metadata] Invalid metadata version ${version}`)
		}
	}

	/**
	 * Decrypt file metadata.
	 * @date 1/31/2024 - 4:20:32 PM
	 *
	 * @public
	 * @async
	 * @param {{ metadata: string }} param0
	 * @param {string} param0.metadata
	 * @returns {Promise<FileMetadata>}
	 */
	public async fileMetadata({ metadata }: { metadata: string }): Promise<FileMetadata> {
		let fileMetadata: FileMetadata = {
			name: "",
			size: 0,
			mime: "application/octet-stream",
			key: "",
			lastModified: Date.now(),
			creation: undefined,
			hash: undefined
		}

		for (const masterKey of this.config.masterKeys.reverse()) {
			try {
				const decrypted = JSON.parse(await this.metadata({ metadata, key: masterKey }))

				if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
					fileMetadata = {
						...decrypted,
						size: parseInt(decrypted.size ?? 0),
						lastModified: convertTimestampToMs(parseInt(decrypted.lastModified ?? Date.now())),
						creation: typeof decrypted.creation === "number" ? convertTimestampToMs(parseInt(decrypted.creation)) : undefined
					}

					break
				}
			} catch {
				continue
			}
		}

		return fileMetadata
	}

	/**
	 * Decrypt folder metadata.
	 * @date 1/31/2024 - 4:26:11 PM
	 *
	 * @public
	 * @async
	 * @param {{ metadata: string }} param0
	 * @param {string} param0.metadata
	 * @returns {Promise<FolderMetadata>}
	 */
	public async folderMetadata({ metadata }: { metadata: string }): Promise<FolderMetadata> {
		let folderMetadata: FolderMetadata = {
			name: ""
		}

		for (const masterKey of this.config.masterKeys.reverse()) {
			try {
				const decrypted = JSON.parse(await this.metadata({ metadata, key: masterKey }))

				if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
					folderMetadata = {
						...folderMetadata,
						name: decrypted.name
					}

					break
				}
			} catch {
				continue
			}
		}

		return folderMetadata
	}
}
