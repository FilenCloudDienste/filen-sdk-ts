import { environment } from "../constants"
import type { CryptoConfig } from "."
import nodeCrypto from "crypto"
import { generateRandomString, deriveKeyFromPassword } from "./utils"

export default class Encrypt {
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
	public async metadata({ data }: { data: string }): Promise<string> {
		const iv = generateRandomString({ length: 12 })
		const ivBuffer = this.textEncoder.encode(iv)
		const lastMasterKey = this.config.masterKeys[this.config.masterKeys.length - 1]
		const key = (await deriveKeyFromPassword({
			password: lastMasterKey,
			salt: lastMasterKey,
			iterations: 1,
			hash: "sha512",
			bitLength: 256,
			returnHex: false
		})) as Uint8Array
		const dataBuffer = this.textEncoder.encode(data)

		if (environment === "node") {
			const cipher = nodeCrypto.createCipheriv("aes-256-gcm", key, ivBuffer)
			const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()])
			const authTag = cipher.getAuthTag()

			return `002${iv}${Buffer.concat([encrypted, authTag]).toString("base64")}`
		} else if (environment === "browser") {
			const encrypted = await globalThis.crypto.subtle.encrypt(
				{
					name: "AES-GCM",
					iv: ivBuffer
				},
				await globalThis.crypto.subtle.importKey("raw", key, "AES-GCM", false, ["encrypt"]),
				dataBuffer
			)

			return `002${iv}${Buffer.from(encrypted).toString("base64")}`
		}

		throw new Error(`crypto.encrypt.metadata not implemented for ${environment} environment`)
	}
}
