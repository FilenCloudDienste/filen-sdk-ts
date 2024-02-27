import { environment, BUFFER_SIZE } from "../constants"
import type { CryptoConfig } from "."
import nodeCrypto from "crypto"
import { generateRandomString, deriveKeyFromPassword, derKeyToPem, importPublicKey, importRawKey } from "./utils"
import { uuidv4, normalizePath } from "../utils"
import pathModule from "path"
import fs from "fs-extra"
import { pipeline } from "stream"
import { promisify } from "util"
import { Semaphore } from "../semaphore"

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
	private readonly config: CryptoConfig
	private readonly textEncoder = new TextEncoder()

	private readonly _semaphores = {
		metadata: new Semaphore(512),
		data: new Semaphore(256)
	}

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
		await this._semaphores.metadata.acquire()

		try {
			const keyToUse = key ? key : this.config.masterKeys[this.config.masterKeys.length - 1]

			if (environment === "reactNative") {
				return await global.nodeThread.encryptMetadata({ data: metadata, key: keyToUse })
			}

			const iv = await generateRandomString({ length: 12 })
			const ivBuffer = this.textEncoder.encode(iv)

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
							returnHex: true
					  })
					: keyToUse
				const dataBuffer = this.textEncoder.encode(metadata)
				const encrypted = await globalThis.crypto.subtle.encrypt(
					{
						name: "AES-GCM",
						iv: ivBuffer
					},
					await importRawKey({ key: derivedKey, algorithm: "AES-GCM", mode: ["encrypt"], keyCache: false }),
					dataBuffer
				)

				return `002${iv}${Buffer.from(encrypted).toString("base64")}`
			} else if (environment === "reactNative") {
				return await global.nodeThread.encryptMetadata({ data: metadata, key: keyToUse })
			}

			throw new Error(`crypto.encrypt.metadata not implemented for ${environment} environment`)
		} finally {
			this._semaphores.metadata.release()
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
		await this._semaphores.metadata.acquire()

		try {
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
		} finally {
			this._semaphores.metadata.release()
		}
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
		return await this.metadata({ metadata: JSON.stringify({ message }), key })
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
		return await this.metadata({ metadata: JSON.stringify({ content }), key })
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
		return await this.metadata({ metadata: JSON.stringify({ title }), key })
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
		return await this.metadata({ metadata: JSON.stringify({ preview }), key })
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
		const keyToUse = key ? key : this.config.masterKeys[this.config.masterKeys.length - 1]

		return await this.metadata({ metadata: JSON.stringify({ name }), key: keyToUse })
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
		return await this.metadata({ metadata: JSON.stringify({ name }), key })
	}

	/**
	 * Encrypt data.
	 * @date 2/7/2024 - 1:50:47 AM
	 *
	 * @public
	 * @async
	 * @param {{ data: Buffer; key: string }} param0
	 * @param {Buffer} param0.data
	 * @param {string} param0.key
	 * @returns {Promise<Buffer>}
	 */
	public async data({ data, key }: { data: Buffer; key: string }): Promise<Buffer> {
		await this._semaphores.data.acquire()

		try {
			const iv = await generateRandomString({ length: 12 })

			if (environment === "node") {
				const ivBuffer = Buffer.from(iv, "utf-8")
				const cipher = nodeCrypto.createCipheriv("aes-256-gcm", Buffer.from(key, "utf-8"), ivBuffer)
				const encrypted = Buffer.concat([cipher.update(data), cipher.final()])
				const authTag = cipher.getAuthTag()
				const ciphertext = Buffer.concat([encrypted, authTag])

				return Buffer.concat([ivBuffer, ciphertext])
			} else if (environment === "browser") {
				const encrypted = await globalThis.crypto.subtle.encrypt(
					{
						name: "AES-GCM",
						iv: this.textEncoder.encode(iv)
					},
					await importRawKey({ key, algorithm: "AES-GCM", mode: ["encrypt"], keyCache: false }),
					data
				)

				return Buffer.concat([this.textEncoder.encode(iv), new Uint8Array(encrypted)])
			} else if (environment === "reactNative") {
				return Buffer.from(await global.nodeThread.encryptData({ base64: Buffer.from(data).toString("base64"), key }))
			}

			throw new Error(`crypto.decrypt.data not implemented for ${environment} environment`)
		} finally {
			this._semaphores.data.release()
		}
	}

	/**
	 * Encrypt a file/chunk using streams. Only available in a Node.JS environment.
	 * @date 2/7/2024 - 1:51:28 AM
	 *
	 * @public
	 * @async
	 * @param {{ inputFile: string; key: string; outputFile?: string }} param0
	 * @param {string} param0.inputFile
	 * @param {string} param0.key
	 * @param {string} param0.outputFile
	 * @returns {Promise<string>}
	 */
	public async dataStream({ inputFile, key, outputFile }: { inputFile: string; key: string; outputFile?: string }): Promise<string> {
		await this._semaphores.data.acquire()

		try {
			if (environment !== "node") {
				throw new Error(`crypto.encrypt.dataStream not implemented for ${environment} environment`)
			}

			const input = normalizePath(inputFile)
			const output = normalizePath(outputFile ? outputFile : pathModule.join(this.config.tmpPath, await uuidv4()))

			if (!(await fs.exists(input))) {
				throw new Error("Input file does not exist.")
			}

			await fs.rm(output, {
				force: true,
				maxRetries: 60 * 10,
				recursive: true,
				retryDelay: 100
			})

			const iv = await generateRandomString({ length: 12 })
			const ivBuffer = Buffer.from(iv, "utf-8")
			const cipher = nodeCrypto.createCipheriv("aes-256-gcm", Buffer.from(key, "utf-8"), ivBuffer)

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
		} finally {
			this._semaphores.data.release()
		}
	}
}

export default Encrypt
