import { environment, BUFFER_SIZE } from "../constants"
import os from "os"
import nodeCrypto from "crypto"
import { generateRandomString, deriveKeyFromPassword, derKeyToPem, importPublicKey, importRawKey, generateRandomBytes } from "./utils"
import { uuidv4, normalizePath } from "../utils"
import pathModule from "path"
import fs from "fs-extra"
import { pipeline } from "stream"
import { promisify } from "util"
import { type FilenSDK, type FileEncryptionVersion } from ".."

const pipelineAsync = promisify(pipeline)

/**
 * Encrypt
 * @date 2/1/2024 - 2:44:28 AM
 *
 * @export
 * @class Encrypt
 * @typedef {Encrypt}
 */
export class Encrypt {
	private readonly sdk: FilenSDK

	public constructor(sdk: FilenSDK) {
		this.sdk = sdk
	}

	public keyLengthToVersionMetadata(key: string): number {
		// V3 keys are 64 hex chars (32 random bytes) and require auth v3
		if (key.length === 64 && this.sdk.config.authVersion === 3) {
			return 3
		}

		return 2
	}

	public keyLengthToVersionData(key: string): FileEncryptionVersion {
		// V3 keys are 64 hex chars (32 random bytes) and require auth v3
		if (key.length === 64 && this.sdk.config.authVersion === 3) {
			return 3
		}

		return 2
	}

	public async metadata({ metadata, key, derive = true }: { metadata: string; key?: string; derive?: boolean }): Promise<string> {
		const keyToUse = key ? key : this.sdk.config.masterKeys ? this.sdk.config.masterKeys.at(-1) : undefined

		if (!keyToUse) {
			throw new Error("crypto.encrypt.metadata no key to use.")
		}

		const version = this.keyLengthToVersionMetadata(keyToUse)

		if (version === 2) {
			const iv = await generateRandomString(12)
			const ivBuffer = Buffer.from(iv, "utf-8")

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
					: Buffer.from(keyToUse, "utf-8")
				const dataBuffer = Buffer.from(metadata, "utf-8")
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
					: Buffer.from(keyToUse, "utf-8")
				const dataBuffer = Buffer.from(metadata, "utf-8")
				const encrypted = await globalThis.crypto.subtle.encrypt(
					{
						name: "AES-GCM",
						iv: ivBuffer
					},
					await importRawKey({
						key: derivedKey as Buffer,
						algorithm: "AES-GCM",
						mode: ["encrypt"],
						keyCache: false
					}),
					dataBuffer
				)

				return `002${iv}${Buffer.from(encrypted).toString("base64")}`
			} else {
				throw new Error(`crypto.encrypt.metadata not implemented for ${environment} environment`)
			}
		} else if (version === 3) {
			const ivBuffer = await generateRandomBytes(12)
			const keyBuffer = Buffer.from(keyToUse, "hex")

			if (environment === "node") {
				const dataBuffer = Buffer.from(metadata, "utf-8")
				const cipher = nodeCrypto.createCipheriv("aes-256-gcm", keyBuffer, ivBuffer)
				const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()])
				const authTag = cipher.getAuthTag()

				return `003${ivBuffer.toString("hex")}${Buffer.concat([encrypted, authTag]).toString("base64")}`
			} else if (environment === "browser") {
				const dataBuffer = Buffer.from(metadata, "utf-8")
				const encrypted = await globalThis.crypto.subtle.encrypt(
					{
						name: "AES-GCM",
						iv: ivBuffer
					},
					await importRawKey({
						key: keyBuffer,
						algorithm: "AES-GCM",
						mode: ["encrypt"],
						keyCache: false
					}),
					dataBuffer
				)

				return `003${ivBuffer.toString("hex")}${Buffer.from(encrypted).toString("base64")}`
			} else {
				throw new Error(`crypto.encrypt.metadata not implemented for ${environment} environment`)
			}
		} else {
			throw new Error(`crypto.encrypt.metadata invalid version ${version}`)
		}
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
			const pemKey = await derKeyToPem({
				key: publicKey
			})
			const encrypted = nodeCrypto.publicEncrypt(
				{
					key: pemKey,
					padding: nodeCrypto.constants.RSA_PKCS1_OAEP_PADDING,
					oaepHash: "sha512"
				},
				Buffer.from(metadata, "utf-8")
			)

			return Buffer.from(encrypted).toString("base64")
		} else if (environment === "browser") {
			const importedPublicKey = await importPublicKey({
				publicKey,
				mode: ["encrypt"]
			})
			const encrypted = await globalThis.crypto.subtle.encrypt(
				{
					name: "RSA-OAEP"
				},
				importedPublicKey,
				Buffer.from(metadata, "utf-8")
			)

			return Buffer.from(encrypted).toString("base64")
		}

		throw new Error(`crypto.encrypt.metadataPublic not implemented for ${environment} environment`)
	}

	/**
	 * Encrypt a chat message using the conversation encryption key.
	 * @date 2/6/2024 - 3:01:09 AM
	 *
	 * @public
	 * @async
	 * @param {{ message: string; key: string }} param0
	 * @param {string} param0.message
	 * @param {string} param0.key
	 * @returns {Promise<string>}
	 */
	public async chatMessage({ message, key }: { message: string; key: string }): Promise<string> {
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		return await this.metadata({
			metadata: JSON.stringify({
				message
			}),
			key
		})
	}

	/**
	 * Encrypt note content using the note's encryption key.
	 * @date 2/6/2024 - 3:02:23 AM
	 *
	 * @public
	 * @async
	 * @param {{ content: string; key: string }} param0
	 * @param {string} param0.content
	 * @param {string} param0.key
	 * @returns {Promise<string>}
	 */
	public async noteContent({ content, key }: { content: string; key: string }): Promise<string> {
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		return await this.metadata({
			metadata: JSON.stringify({
				content
			}),
			key
		})
	}

	/**
	 * Encrypt the note's title using the note's encryption key.
	 * @date 2/6/2024 - 3:02:44 AM
	 *
	 * @public
	 * @async
	 * @param {{ title: string; key: string }} param0
	 * @param {string} param0.title
	 * @param {string} param0.key
	 * @returns {Promise<string>}
	 */
	public async noteTitle({ title, key }: { title: string; key: string }): Promise<string> {
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		return await this.metadata({
			metadata: JSON.stringify({
				title
			}),
			key
		})
	}

	/**
	 * Encrypt the note's preview using the note's encryption key.
	 * @date 2/6/2024 - 3:02:56 AM
	 *
	 * @public
	 * @async
	 * @param {{ preview: string; key: string }} param0
	 * @param {string} param0.preview
	 * @param {string} param0.key
	 * @returns {Promise<string>}
	 */
	public async notePreview({ preview, key }: { preview: string; key: string }): Promise<string> {
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		return await this.metadata({
			metadata: JSON.stringify({ preview }),
			key
		})
	}

	/**
	 * Encrypt a tag's name using the given key.
	 * @date 2/20/2024 - 3:21:12 AM
	 *
	 * @public
	 * @async
	 * @param {{ name: string; key?: string }} param0
	 * @param {string} param0.name
	 * @param {string} param0.key
	 * @returns {Promise<string>}
	 */
	public async noteTagName({ name, key }: { name: string; key?: string }): Promise<string> {
		const keyToUse = key ? key : this.sdk.config.masterKeys ? this.sdk.config.masterKeys.at(-1) : undefined

		if (keyToUse!.length === 0) {
			throw new Error("Invalid key.")
		}

		return await this.metadata({
			metadata: JSON.stringify({
				name
			}),
			key: keyToUse!
		})
	}

	/**
	 * Encrypt the conversation name using the conversation encryption key.
	 * @date 2/6/2024 - 3:03:45 AM
	 *
	 * @public
	 * @async
	 * @param {{ name: string; key: string }} param0
	 * @param {string} param0.name
	 * @param {string} param0.key
	 * @returns {Promise<string>}
	 */
	public async chatConversationName({ name, key }: { name: string; key: string }): Promise<string> {
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		return await this.metadata({
			metadata: JSON.stringify({
				name
			}),
			key
		})
	}

	public async data({ data, key }: { data: Buffer; key: string }): Promise<Buffer> {
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		const version = this.keyLengthToVersionData(key)

		if (version === 2) {
			const iv = await generateRandomString(12)
			const ivBuffer = Buffer.from(iv, "utf-8")

			if (environment === "node") {
				const cipher = nodeCrypto.createCipheriv("aes-256-gcm", Buffer.from(key, "utf-8"), ivBuffer)
				const encrypted = Buffer.concat([cipher.update(data), cipher.final()])
				const authTag = cipher.getAuthTag()
				const ciphertext = Buffer.concat([encrypted, authTag])

				return Buffer.concat([ivBuffer, ciphertext])
			} else if (environment === "browser") {
				const encrypted = await globalThis.crypto.subtle.encrypt(
					{
						name: "AES-GCM",
						iv: ivBuffer
					},
					await importRawKey({
						key: Buffer.from(key, "utf-8"),
						algorithm: "AES-GCM",
						mode: ["encrypt"],
						keyCache: false
					}),
					data
				)

				return Buffer.concat([ivBuffer, new Uint8Array(encrypted)])
			} else {
				throw new Error(`crypto.decrypt.data not implemented for ${environment} environment`)
			}
		} else if (version === 3) {
			const ivBuffer = await generateRandomBytes(12)
			const keyBuffer = Buffer.from(key, "hex")

			if (environment === "node") {
				const cipher = nodeCrypto.createCipheriv("aes-256-gcm", keyBuffer, ivBuffer)
				const encrypted = Buffer.concat([cipher.update(data), cipher.final()])
				const authTag = cipher.getAuthTag()
				const ciphertext = Buffer.concat([encrypted, authTag])

				return Buffer.concat([ivBuffer, ciphertext])
			} else if (environment === "browser") {
				const encrypted = await globalThis.crypto.subtle.encrypt(
					{
						name: "AES-GCM",
						iv: ivBuffer
					},
					await importRawKey({
						key: keyBuffer,
						algorithm: "AES-GCM",
						mode: ["encrypt"],
						keyCache: false
					}),
					data
				)

				return Buffer.concat([ivBuffer, new Uint8Array(encrypted)])
			} else {
				throw new Error(`crypto.decrypt.data not implemented for ${environment} environment`)
			}
		} else {
			throw new Error(`crypto.encrypt.data invalid version ${version}`)
		}
	}

	public async dataStream({ inputFile, key, outputFile }: { inputFile: string; key: string; outputFile?: string }): Promise<string> {
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		if (environment !== "node") {
			throw new Error(`crypto.encrypt.dataStream not implemented for ${environment} environment`)
		}

		const input = normalizePath(inputFile)
		const output = normalizePath(outputFile ? outputFile : pathModule.join(this.sdk.config.tmpPath ?? os.tmpdir(), await uuidv4()))

		if (!(await fs.exists(input))) {
			throw new Error("Input file does not exist.")
		}

		await fs.rm(output, {
			force: true,
			maxRetries: 60 * 10,
			recursive: true,
			retryDelay: 100
		})

		const version = this.keyLengthToVersionData(key)
		const keyBuffer = version === 2 ? Buffer.from(key, "utf-8") : Buffer.from(key, "hex")
		const ivBuffer = version === 2 ? Buffer.from(await generateRandomString(12), "utf-8") : await generateRandomBytes(12)
		const cipher = nodeCrypto.createCipheriv("aes-256-gcm", keyBuffer, ivBuffer)
		const readStream = fs.createReadStream(normalizePath(input), {
			highWaterMark: BUFFER_SIZE
		})
		const writeStream = fs.createWriteStream(normalizePath(output))

		await new Promise<void>((resolve, reject) => {
			writeStream.write(ivBuffer, err => {
				if (err) {
					reject(err)

					return
				}

				resolve()
			})
		})

		await pipelineAsync(readStream, cipher, writeStream)

		const authTag = cipher.getAuthTag()

		await fs.appendFile(output, authTag)

		return output
	}
}

export default Encrypt
