import { environment } from "../constants"
import type { CryptoConfig } from "."
import nodeCrypto from "crypto"
import { generateRandomString, deriveKeyFromPassword, derKeyToPem, importPublicKey } from "./utils"

/**
 * Encrypt
 * @date 2/1/2024 - 2:44:28 AM
 *
 * @export
 * @class Encrypt
 * @typedef {Encrypt}
 */
export class Encrypt {
	private readonly config: CryptoConfig
	private readonly textEncoder = new TextEncoder()
	private readonly textDecoder = new TextDecoder()

	/**
	 * Creates an instance of Encrypt.
	 * @date 1/31/2024 - 3:59:21 PM
	 *
	 * @constructor
	 * @public
	 * @param {CryptoConfig} params
	 */
	public constructor(params: CryptoConfig) {
		this.config = params
	}

	/**
	 * Encrypt a string using the user's last master key.
	 * @date 1/31/2024 - 3:59:29 PM
	 *
	 * @public
	 * @async
	 * @param {{ data: string }} param0
	 * @param {string} param0.data
	 * @returns {Promise<string>}
	 */
	public async metadata({ metadata, key, derive = true }: { metadata: string; key?: string; derive?: boolean }): Promise<string> {
		const iv = await generateRandomString({ length: 12 })
		const ivBuffer = this.textEncoder.encode(iv)
		const keyToUse = key ? key : this.config.masterKeys[this.config.masterKeys.length - 1]

		if (environment === "node") {
			const derivedKey = derive
				? await deriveKeyFromPassword({
						password: keyToUse,
						salt: keyToUse,
						iterations: 1,
						hash: "sha512",
						bitLength: 256,
						returnHex: false
				  })
				: this.textEncoder.encode(keyToUse)
			const dataBuffer = this.textEncoder.encode(metadata)
			const cipher = nodeCrypto.createCipheriv("aes-256-gcm", derivedKey, ivBuffer)
			const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()])
			const authTag = cipher.getAuthTag()

			return `002${iv}${Buffer.concat([encrypted, authTag]).toString("base64")}`
		} else if (environment === "browser") {
			const derivedKey = derive
				? await deriveKeyFromPassword({
						password: keyToUse,
						salt: keyToUse,
						iterations: 1,
						hash: "sha512",
						bitLength: 256,
						returnHex: false
				  })
				: this.textEncoder.encode(keyToUse)
			const dataBuffer = this.textEncoder.encode(metadata)
			const encrypted = await globalThis.crypto.subtle.encrypt(
				{
					name: "AES-GCM",
					iv: ivBuffer
				},
				await globalThis.crypto.subtle.importKey("raw", derivedKey, "AES-GCM", false, ["encrypt"]),
				dataBuffer
			)

			return `002${iv}${Buffer.from(encrypted).toString("base64")}`
		} else if (environment === "reactNative") {
			return await global.nodeThread.encryptMetadata({ data: metadata, key: keyToUse })
		}

		throw new Error(`crypto.encrypt.metadata not implemented for ${environment} environment`)
	}

	/**
	 * Encrypts metadata using a public key.
	 * @date 2/2/2024 - 6:49:12 PM
	 *
	 * @public
	 * @async
	 * @param {{ metadata: string; publicKey: string }} param0
	 * @param {string} param0.metadata
	 * @param {string} param0.publicKey
	 * @returns {Promise<string>}
	 */
	public async metadataPublic({ metadata, publicKey }: { metadata: string; publicKey: string }): Promise<string> {
		if (environment === "node") {
			const pemKey = await derKeyToPem({ key: publicKey })
			const encrypted = nodeCrypto.publicEncrypt(
				{
					key: pemKey,
					padding: nodeCrypto.constants.RSA_PKCS1_OAEP_PADDING,
					oaepHash: "sha512"
				},
				this.textEncoder.encode(metadata)
			)

			return Buffer.from(encrypted).toString("base64")
		} else if (environment === "browser") {
			const importedPublicKey = await importPublicKey({ publicKey, mode: ["encrypt"] })
			const encrypted = await globalThis.crypto.subtle.encrypt(
				{
					name: "RSA-OAEP"
				},
				importedPublicKey,
				this.textEncoder.encode(metadata)
			)

			return Buffer.from(encrypted).toString("base64")
		} else if (environment === "reactNative") {
			return await global.nodeThread.encryptMetadataPublicKey({ data: metadata, publicKey })
		}

		throw new Error(`crypto.encrypt.metadataPublic not implemented for ${environment} environment`)
	}
}

export default Encrypt
