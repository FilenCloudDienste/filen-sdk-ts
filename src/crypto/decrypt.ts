import { environment, BUFFER_SIZE } from "../constants"
import type { CryptoConfig } from "."
import { deriveKeyFromPassword, importPrivateKey, derKeyToPem, importRawAESGCMKey, EVP_BytesToKey } from "./utils"
import CryptoJS from "crypto-js"
import nodeCrypto from "crypto"
import type { FileMetadata, FolderMetadata, FileEncryptionVersion } from "../types"
import { convertTimestampToMs, uuidv4 } from "../utils"
import cache from "../cache"
import pathModule from "path"
import fs from "fs-extra"
import { streamDecodeBase64 } from "./streams/base64"
import { pipeline } from "stream"
import { promisify } from "util"

const pipelineAsync = promisify(pipeline)

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
						await importRawAESGCMKey({ key, mode: ["decrypt"] }),
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

	/**
	 * Decrypt file metadata inside a public link.
	 * @date 2/6/2024 - 3:05:42 AM
	 *
	 * @public
	 * @async
	 * @param {{ metadata: string; linkKey: string }} param0
	 * @param {string} param0.metadata
	 * @param {string} param0.linkKey
	 * @returns {Promise<FileMetadata>}
	 */
	public async fileMetadataLink({ metadata, linkKey }: { metadata: string; linkKey: string }): Promise<FileMetadata> {
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

		const decrypted = JSON.parse(await this.metadata({ metadata, key: linkKey }))

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
			throw new Error("Could not decrypt file metadata (link) using given key.")
		}

		return fileMetadata
	}

	/**
	 * Decrypt folder metadata inside a public link.
	 * @date 2/6/2024 - 3:07:06 AM
	 *
	 * @public
	 * @async
	 * @param {{ metadata: string; linkKey: string }} param0
	 * @param {string} param0.metadata
	 * @param {string} param0.linkKey
	 * @returns {Promise<FolderMetadata>}
	 */
	public async folderMetadataLink({ metadata, linkKey }: { metadata: string; linkKey: string }): Promise<FolderMetadata> {
		if (this.config.metadataCache && cache.folderMetadata.has(metadata)) {
			return cache.folderMetadata.get(metadata)!
		}

		let folderMetadata: FolderMetadata = {
			name: ""
		}

		const decrypted = JSON.parse(await this.metadata({ metadata, key: linkKey }))

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
			throw new Error("Could not decrypt folder metadata (link) using given key.")
		}

		return folderMetadata
	}

	/**
	 * Decrypt a public link folder encryption key (using given key or master keys).
	 * @date 2/6/2024 - 3:09:37 AM
	 *
	 * @public
	 * @async
	 * @param {{ metadata: string; key?: string }} param0
	 * @param {string} param0.metadata
	 * @param {string} param0.key
	 * @returns {Promise<string>}
	 */
	public async folderLinkKey({ metadata, key }: { metadata: string; key?: string }): Promise<string> {
		if (this.config.metadataCache && cache.folderLinkKey.has(metadata)) {
			return cache.folderLinkKey.get(metadata)!
		}

		const keysToUse = key ? [key] : this.config.masterKeys.reverse()

		for (const masterKey of keysToUse) {
			try {
				const decrypted = JSON.parse(await this.metadata({ metadata, key: masterKey }))

				if (typeof decrypted === "string" && decrypted.length > 0) {
					if (this.config.metadataCache) {
						cache.folderLinkKey.set(metadata, decrypted)
					}

					return decrypted
				}
			} catch {
				continue
			}
		}

		throw new Error("Could not decrypt folder link key using given keys.")
	}

	/**
	 * Decrypts a chat encryption (symmetric) key.
	 * @date 2/6/2024 - 12:54:25 AM
	 *
	 * @public
	 * @async
	 * @param {{metadata: string, privateKey: string}} param0
	 * @param {string} param0.metadata
	 * @param {string} param0.privateKey
	 * @returns {Promise<string>}
	 */
	public async chatKey({ metadata, privateKey }: { metadata: string; privateKey: string }): Promise<string> {
		if (this.config.metadataCache && cache.chatKey.has(metadata)) {
			return cache.chatKey.get(metadata)!
		}

		const decrypted = await this.metadataPrivate({ metadata, privateKey })
		const parsed = JSON.parse(decrypted)

		if (typeof parsed.key !== "string") {
			throw new Error("Could not decrypt chat key, malformed decrypted metadata")
		}

		if (this.config.metadataCache) {
			cache.chatKey.set(metadata, parsed.key)
		}

		return parsed.key
	}

	/**
	 * Decrypts a chat message with the given participant metadata (participant metadata includes the symmetric chat encryption key).
	 * @date 2/6/2024 - 12:57:06 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		message: string
	 * 		metadata: string
	 * 		privateKey: string
	 * 	}} param0
	 * @param {string} param0.message
	 * @param {string} param0.metadata
	 * @param {string} param0.privateKey
	 * @returns {Promise<string>}
	 */
	public async chatMessage({
		message,
		metadata,
		privateKey
	}: {
		message: string
		metadata: string
		privateKey: string
	}): Promise<string> {
		const keyDecrypted = await this.chatKey({ metadata, privateKey })
		const messageDecrypted = await this.metadata({ metadata: message, key: keyDecrypted })
		const parsedMessage = JSON.parse(messageDecrypted)

		if (typeof parsedMessage.message !== "string") {
			throw new Error("Could not decrypt chat message, malformed decrypted metadata")
		}

		return parsedMessage.message
	}

	/**
	 * Decrypts the symmetric note encryption key with the given owner metadata.
	 * @date 2/6/2024 - 1:01:59 AM
	 *
	 * @public
	 * @async
	 * @param {{ metadata: string; key?: string }} param0
	 * @param {string} param0.metadata
	 * @param {string} param0.key
	 * @returns {Promise<string>}
	 */
	public async noteKeyOwner({ metadata, key }: { metadata: string; key?: string }): Promise<string> {
		if (this.config.metadataCache && cache.noteKeyOwner.has(metadata)) {
			return cache.noteKeyOwner.get(metadata)!
		}

		const keysToUse = key ? [key] : this.config.masterKeys.reverse()

		for (const masterKey of keysToUse) {
			try {
				const decrypted = JSON.parse(await this.metadata({ metadata, key: masterKey }))

				if (decrypted && typeof decrypted.key === "string" && decrypted.key.length > 0) {
					if (this.config.metadataCache) {
						cache.noteKeyOwner.set(metadata, decrypted.key)
					}

					return decrypted.key
				}
			} catch {
				continue
			}
		}

		throw new Error("Could not decrypt note key (owner) using given metadata and keys")
	}

	/**
	 * Decrypt a symmetric note encryption key using participant metadata and their private key.
	 * @date 2/6/2024 - 2:47:34 AM
	 *
	 * @public
	 * @async
	 * @param {{metadata: string, privateKey: string}} param0
	 * @param {string} param0.metadata
	 * @param {string} param0.privateKey
	 * @returns {Promise<string>}
	 */
	public async noteKeyParticipant({ metadata, privateKey }: { metadata: string; privateKey: string }): Promise<string> {
		if (this.config.metadataCache && cache.noteKeyParticipant.has(metadata)) {
			return cache.noteKeyParticipant.get(metadata)!
		}

		const decrypted = await this.metadataPrivate({ metadata, privateKey })
		const parsed = JSON.parse(decrypted)

		if (typeof parsed.key !== "string") {
			throw new Error("Could not decrypt note key of participant, malformed decrypted metadata")
		}

		if (this.config.metadataCache) {
			cache.noteKeyParticipant.set(metadata, parsed.key)
		}

		return parsed.key
	}

	/**
	 * Decrypt note content using the note's symmetric encryption key.
	 * @date 2/6/2024 - 2:50:15 AM
	 *
	 * @public
	 * @async
	 * @param {{content: string, key: string}} param0
	 * @param {string} param0.content
	 * @param {string} param0.key
	 * @returns {Promise<string>}
	 */
	public async noteContent({ content, key }: { content: string; key: string }): Promise<string> {
		const decrypted = await this.metadata({ metadata: content, key })
		const parsed = JSON.parse(decrypted)

		if (typeof parsed.content !== "string") {
			throw new Error("Could not decrypt note content, malformed decrypted metadata")
		}

		return parsed.content
	}

	/**
	 * Decrypt a note's title using the note's symmetric encryption key.
	 * @date 2/6/2024 - 2:52:02 AM
	 *
	 * @public
	 * @async
	 * @param {{title: string, key: string}} param0
	 * @param {string} param0.title
	 * @param {string} param0.key
	 * @returns {Promise<string>}
	 */
	public async noteTitle({ title, key }: { title: string; key: string }): Promise<string> {
		if (this.config.metadataCache && cache.noteTitle.has(title)) {
			return cache.noteTitle.get(title)!
		}

		const decrypted = await this.metadata({ metadata: title, key })
		const parsed = JSON.parse(decrypted)

		if (typeof parsed.title !== "string") {
			throw new Error("Could not decrypt note title, malformed decrypted metadata")
		}

		if (this.config.metadataCache) {
			cache.noteTitle.set(title, parsed.title)
		}

		return parsed.title
	}

	/**
	 * Decrypt a note's preview using the note's symmetric encryption key.
	 * @date 2/6/2024 - 2:53:35 AM
	 *
	 * @public
	 * @async
	 * @param {{ preview: string; key: string }} param0
	 * @param {string} param0.preview
	 * @param {string} param0.key
	 * @returns {Promise<string>}
	 */
	public async notePreview({ preview, key }: { preview: string; key: string }): Promise<string> {
		if (this.config.metadataCache && cache.notePreview.has(preview)) {
			return cache.notePreview.get(preview)!
		}

		const decrypted = await this.metadata({ metadata: preview, key })
		const parsed = JSON.parse(decrypted)

		if (typeof parsed.preview !== "string") {
			throw new Error("Could not decrypt note preview, malformed decrypted metadata")
		}

		if (this.config.metadataCache) {
			cache.notePreview.set(preview, parsed.preview)
		}

		return parsed.preview
	}

	/**
	 * Decrypt a note tag name using the master keys or a given key.
	 * @date 2/6/2024 - 2:56:38 AM
	 *
	 * @public
	 * @async
	 * @param {{name: string, key?: string}} param0
	 * @param {string} param0.name
	 * @param {string} param0.key
	 * @returns {Promise<string>}
	 */
	public async noteTagName({ name, key }: { name: string; key?: string }): Promise<string> {
		if (this.config.metadataCache && cache.noteTagName.has(name)) {
			return cache.noteTagName.get(name)!
		}

		const keysToUse = key ? [key] : this.config.masterKeys.reverse()

		for (const masterKey of keysToUse) {
			try {
				const decrypted = JSON.parse(await this.metadata({ metadata: name, key: masterKey }))

				if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
					if (this.config.metadataCache) {
						cache.noteTagName.set(name, decrypted.name)
					}

					return decrypted.name
				}
			} catch {
				continue
			}
		}

		throw new Error("Could not decrypt note tag name using given metadata and keys")
	}

	/**
	 * Decrypt a chat conversation name using the participants metadata and private key.
	 * @date 2/6/2024 - 2:59:41 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		name: string
	 * 		metadata: string
	 * 		privateKey: string
	 * 	}} param0
	 * @param {string} param0.name
	 * @param {string} param0.metadata
	 * @param {string} param0.privateKey
	 * @returns {Promise<string>}
	 */
	public async chatConversationName({
		name,
		metadata,
		privateKey
	}: {
		name: string
		metadata: string
		privateKey: string
	}): Promise<string> {
		if (this.config.metadataCache && cache.chatConversationName.has(name)) {
			return cache.chatConversationName.get(name)!
		}

		const keyDecrypted = await this.chatKey({ metadata, privateKey })
		const nameDecrypted = await this.metadata({ metadata: name, key: keyDecrypted })
		const parsed = JSON.parse(nameDecrypted)

		if (typeof parsed.name !== "string") {
			throw new Error("Could not decrypt chat conversation name, malformed decrypted metadata")
		}

		if (this.config.metadataCache) {
			cache.chatConversationName.set(name, parsed.name)
		}

		return parsed.name
	}

	/**
	 * Decrypt data.
	 * @date 2/7/2024 - 1:50:58 AM
	 *
	 * @public
	 * @async
	 * @param {{ data: Uint8Array; key: string; version: FileEncryptionVersion }} param0
	 * @param {Uint8Array} param0.data
	 * @param {string} param0.key
	 * @param {FileEncryptionVersion} param0.version
	 * @returns {Promise<Uint8Array>}
	 */
	public async data({ data, key, version }: { data: Uint8Array; key: string; version: FileEncryptionVersion }): Promise<Uint8Array> {
		if (environment === "node") {
			if (version === 1) {
				// Old and deprecated, not in use anymore, just here for backwards compatibility
				// @TODO
			} else if (version === 2) {
				const iv = data.slice(0, 12)
				const encData = data.slice(12)
				const authTag = encData.slice(encData.byteLength - ((128 + 7) >> 3))
				const ciphertext = encData.slice(0, encData.byteLength - authTag.byteLength)
				const decipher = nodeCrypto.createDecipheriv("aes-256-gcm", Buffer.from(key, "utf-8"), iv)

				decipher.setAuthTag(authTag)

				return Buffer.concat([decipher.update(ciphertext), decipher.final()])
			}
		} else if (environment === "browser") {
			if (version === 1) {
				// Old and deprecated, not in use anymore, just here for backwards compatibility
				// @TODO
			} else if (version === 2) {
				const iv = data.slice(0, 12)
				const encData = data.slice(12)
				const decrypted = await globalThis.crypto.subtle.decrypt(
					{
						name: "AES-GCM",
						iv
					},
					await importRawAESGCMKey({ key, mode: ["decrypt"] }),
					encData
				)
				return new Uint8Array(decrypted)
			}
		} else if (environment === "reactNative") {
			return await global.nodeThread.decryptData({ base64: Buffer.from(data).toString("base64"), key, version })
		}

		throw new Error(`crypto.decrypt.data not implemented for ${environment} environment`)
	}

	/**
	 * Decrypt a file/chunk using streams. Only available in a Node.JS environment.
	 * @date 2/7/2024 - 1:38:12 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		inputFile: string
	 * 		key: string
	 * 		version: FileEncryptionVersion
	 * 		outputFile?: string
	 * 	}} param0
	 * @param {string} param0.inputFile
	 * @param {string} param0.key
	 * @param {FileEncryptionVersion} param0.version
	 * @param {string} param0.outputFile
	 * @returns {Promise<string>}
	 */
	public async dataStream({
		inputFile,
		key,
		version,
		outputFile
	}: {
		inputFile: string
		key: string
		version: FileEncryptionVersion
		outputFile?: string
	}): Promise<string> {
		if (environment !== "node") {
			throw new Error(`crypto.decrypt.dataStream not implemented for ${environment} environment`)
		}

		let input = pathModule.normalize(inputFile)
		const output = pathModule.normalize(outputFile ? outputFile : pathModule.join(this.config.tmpPath, await uuidv4()))

		if (!(await fs.exists(input))) {
			throw new Error("Input file does not exist.")
		}

		await fs.rm(output, {
			force: true,
			maxRetries: 60 * 100,
			recursive: true,
			retryDelay: 100
		})

		const inputStat = await fs.stat(input)

		if (inputStat.size < (version === 1 ? 17 : 13)) {
			throw new Error(`Input file size too small: ${inputStat.size}.`)
		}

		let inputHandle = await fs.open(input, fs.constants.R_OK)
		let decipher: nodeCrypto.Decipher | nodeCrypto.DecipherGCM
		let bytesToSkipAtStartOfInputStream = 0
		let bytesToSkipAtEndOfInputStream = 0
		let inputFileSize = 0

		try {
			if (version === 1) {
				const firstBytes = Buffer.alloc(16)

				await fs.read(inputHandle, firstBytes, 0, 16, 0)

				if (firstBytes.byteLength === 0) {
					throw new Error("Could not read input file.")
				}

				const asciiString = firstBytes.toString("ascii")
				const base64String = firstBytes.toString("base64")
				const utf8String = firstBytes.toString("utf-8")
				let needsConvert = true
				let isCBC = true

				if (asciiString.startsWith("Salted_") || base64String.startsWith("Salted_") || utf8String.startsWith("Salted_")) {
					needsConvert = false
				}

				if (
					asciiString.startsWith("Salted_") ||
					base64String.startsWith("Salted_") ||
					utf8String.startsWith("U2FsdGVk") ||
					asciiString.startsWith("U2FsdGVk") ||
					utf8String.startsWith("Salted_") ||
					base64String.startsWith("U2FsdGVk")
				) {
					isCBC = false
				}

				if (needsConvert && !isCBC) {
					const inputConverted = pathModule.join(pathModule.dirname(output), await uuidv4())

					await fs.rm(inputConverted, {
						force: true,
						maxRetries: 60 * 100,
						recursive: true,
						retryDelay: 100
					})

					await fs.close(inputHandle)

					const oldInput = input

					input = await streamDecodeBase64({ input, output: inputConverted })
					inputHandle = await fs.open(input, fs.constants.R_OK)

					await fs.rm(oldInput, {
						force: true,
						maxRetries: 60 * 100,
						recursive: true,
						retryDelay: 100
					})
				}

				if (!isCBC) {
					const saltBytes = Buffer.alloc(8)

					await fs.read(inputHandle, saltBytes, 0, 8, 0)

					const { key: keyBytes, iv: ivBytes } = EVP_BytesToKey({
						password: Buffer.from(key, "utf-8"),
						salt: saltBytes,
						keyBits: 256,
						ivLength: 16
					})

					decipher = nodeCrypto.createDecipheriv("aes-256-cbc", keyBytes, ivBytes)
					bytesToSkipAtStartOfInputStream = 16
					bytesToSkipAtEndOfInputStream = 0
				} else {
					const keyBytes = Buffer.from(key, "utf-8")
					const ivBytes = keyBytes.subarray(0, 16)

					decipher = nodeCrypto.createDecipheriv("aes-256-cbc", keyBytes, ivBytes)
					bytesToSkipAtStartOfInputStream = 0
					bytesToSkipAtEndOfInputStream = 0
				}
			} else if (version === 2) {
				const keyBytes = Buffer.from(key, "utf-8")
				const ivBytes = Buffer.alloc(12)
				const authTagBytes = Buffer.alloc(16)

				const stat = await fs.stat(input)

				await fs.read(inputHandle, ivBytes, 0, 12, 0)
				await fs.read(inputHandle, authTagBytes, 0, 16, stat.size - 16)

				if (ivBytes.byteLength === 0 || authTagBytes.byteLength === 0) {
					throw new Error("Could not read input file.")
				}

				decipher = nodeCrypto.createDecipheriv("aes-256-gcm", keyBytes, ivBytes).setAuthTag(authTagBytes)

				bytesToSkipAtStartOfInputStream = 12
				bytesToSkipAtEndOfInputStream = 16
				inputFileSize = stat.size
			} else {
				throw new Error(`Invalid FileEncryptionVersion: ${version}`)
			}
		} finally {
			await fs.close(inputHandle)
		}

		const readStream = fs.createReadStream(pathModule.normalize(input), {
			highWaterMark: BUFFER_SIZE,
			end: inputFileSize > 0 ? inputFileSize - bytesToSkipAtEndOfInputStream - 1 : Infinity,
			start: bytesToSkipAtStartOfInputStream
		})
		const writeStream = fs.createWriteStream(pathModule.normalize(output))

		await pipelineAsync(readStream, decipher, writeStream)

		return output
	}
}

export default Decrypt
