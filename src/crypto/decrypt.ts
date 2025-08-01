import { environment, BUFFER_SIZE } from "../constants"
import type FilenSDK from ".."
import { deriveKeyFromPassword, importPrivateKey, derKeyToPem, importRawKey, EVP_BytesToKey } from "./utils"
import nodeCrypto from "crypto"
import { type FileMetadata, type FolderMetadata, type FileEncryptionVersion } from "../types"
import { convertTimestampToMs, uuidv4, normalizePath, fastStringHash } from "../utils"
import cache from "../cache"
import pathModule from "path"
import fs from "fs-extra"
import { streamDecodeBase64 } from "../streams/base64"
import CryptoJS from "crypto-js"
import { type UserEvent } from "../api/v3/user/events"
import os from "os"
import forge from "node-forge"
import { pipeline } from "stream"

/**
 * Decrypt
 * @date 1/31/2024 - 6:36:57 PM
 *
 * @export
 * @class Decrypt
 * @typedef {Decrypt}
 */
export class Decrypt {
	private readonly sdk: FilenSDK

	public constructor(sdk: FilenSDK) {
		this.sdk = sdk
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
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		const sliced = metadata.slice(0, 8)

		if (sliced === "U2FsdGVk") {
			// Old and deprecated, not in use anymore, just here for backwards compatibility
			return CryptoJS.AES.decrypt(metadata, key).toString(CryptoJS.enc.Utf8)
		} else {
			const version = metadata.slice(0, 3)

			if (version === "002") {
				const keyBuffer = await deriveKeyFromPassword({
					password: key,
					salt: key,
					iterations: 1,
					hash: "sha512",
					bitLength: 256,
					returnHex: false
				})
				const ivBuffer = Buffer.from(metadata.slice(3, 15), "utf-8")
				const encrypted = Buffer.from(metadata.slice(15), "base64")

				if (environment === "node" || environment === "react-native") {
					const authTag = encrypted.subarray(-16)
					const cipherText = encrypted.subarray(0, encrypted.byteLength - 16)
					const decipher = nodeCrypto.createDecipheriv("aes-256-gcm", keyBuffer, ivBuffer)

					decipher.setAuthTag(authTag)

					return Buffer.concat([decipher.update(cipherText), decipher.final()]).toString("utf-8")
				} else if (environment === "browser") {
					const decrypted = await globalThis.crypto.subtle.decrypt(
						{
							name: "AES-GCM",
							iv: ivBuffer
						},
						await importRawKey({
							key: keyBuffer,
							algorithm: "AES-GCM",
							mode: ["decrypt"]
						}),
						encrypted
					)

					return Buffer.from(decrypted).toString("utf-8")
				} else {
					throw new Error(`crypto.decrypt.metadata is not implemented for ${environment} environment`)
				}
			} else if (version === "003") {
				if (key.length !== 64) {
					throw new Error(`[crypto.decrypt.metadata] Invalid key length ${key.length}. Expected 64 (hex).`)
				}

				const keyBuffer = Buffer.from(key, "hex")
				const ivBuffer = Buffer.from(metadata.slice(3, 27), "hex")
				const encrypted = Buffer.from(metadata.slice(27), "base64")

				if (environment === "node" || environment === "react-native") {
					const authTag = encrypted.subarray(-16)
					const cipherText = encrypted.subarray(0, encrypted.byteLength - 16)
					const decipher = nodeCrypto.createDecipheriv("aes-256-gcm", keyBuffer, ivBuffer)

					decipher.setAuthTag(authTag)

					return Buffer.concat([decipher.update(cipherText), decipher.final()]).toString("utf-8")
				} else if (environment === "browser") {
					const decrypted = await globalThis.crypto.subtle.decrypt(
						{
							name: "AES-GCM",
							iv: ivBuffer
						},
						await importRawKey({
							key: keyBuffer,
							algorithm: "AES-GCM",
							mode: ["decrypt"]
						}),
						encrypted
					)

					return Buffer.from(decrypted).toString("utf-8")
				} else {
					throw new Error(`crypto.decrypt.metadata is not implemented for ${environment} environment`)
				}
			} else {
				throw new Error(`[crypto.decrypt.metadata] Invalid metadata version ${version}`)
			}
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
		if (privateKey.length === 0) {
			throw new Error("Invalid privateKey.")
		}

		if (environment === "node") {
			const pemKey = await derKeyToPem({
				key: privateKey
			})
			const decrypted = nodeCrypto.privateDecrypt(
				{
					key: pemKey,
					padding: nodeCrypto.constants.RSA_PKCS1_OAEP_PADDING,
					oaepHash: "sha512"
				},
				Buffer.from(metadata, "base64")
			)

			return decrypted.toString("utf-8")
		} else if (environment === "react-native") {
			const pemKey = await derKeyToPem({
				key: privateKey
			})
			const forgePrivatKey = forge.pki.privateKeyFromPem(pemKey)
			const encryptedBytes = forge.util.decode64(metadata)
			const decrypted = forgePrivatKey.decrypt(encryptedBytes, "RSA-OAEP", {
				md: forge.md.sha512.create(),
				mgf1: {
					md: forge.md.sha512.create()
				}
			})

			return decrypted
		} else if (environment === "browser") {
			const importedPrivateKey = await importPrivateKey({
				privateKey,
				mode: ["decrypt"]
			})
			const decrypted = await globalThis.crypto.subtle.decrypt(
				{
					name: "RSA-OAEP"
				},
				importedPrivateKey,
				Buffer.from(metadata, "base64")
			)

			return Buffer.from(decrypted).toString("utf-8")
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
		const cacheKey = fastStringHash(metadata)

		if (this.sdk.config.metadataCache && cache.fileMetadata.has(cacheKey)) {
			return cache.fileMetadata.get(cacheKey)!
		}

		let fileMetadata: FileMetadata = {
			name: "",
			size: 1,
			mime: "application/octet-stream",
			key: "",
			lastModified: Date.now(),
			creation: undefined,
			hash: undefined
		}

		const keysToUse = key ? [key] : this.sdk.config.masterKeys ?? []

		for (const masterKey of keysToUse) {
			try {
				const decrypted = JSON.parse(
					await this.metadata({
						metadata,
						key: masterKey
					})
				)

				if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
					const lastModifiedParsed = parseInt(decrypted.lastModified ?? Date.now())

					fileMetadata = {
						size: parseInt(decrypted.size ?? 0),
						lastModified: lastModifiedParsed > 0 ? convertTimestampToMs(lastModifiedParsed) : Date.now(),
						creation: typeof decrypted.creation === "number" ? convertTimestampToMs(parseInt(decrypted.creation)) : undefined,
						name: decrypted.name,
						key: decrypted.key,
						mime: decrypted.mime,
						hash: decrypted.hash
					}

					if (this.sdk.config.metadataCache) {
						cache.fileMetadata.set(cacheKey, fileMetadata)
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
		if (metadata === "default") {
			return {
				name: "Default"
			}
		}

		const cacheKey = fastStringHash(metadata)

		if (this.sdk.config.metadataCache && cache.folderMetadata.has(cacheKey)) {
			return cache.folderMetadata.get(cacheKey)!
		}

		let folderMetadata: FolderMetadata = {
			name: ""
		}

		const keysToUse = key ? [key] : this.sdk.config.masterKeys ?? []

		for (const masterKey of keysToUse) {
			try {
				const decrypted = JSON.parse(
					await this.metadata({
						metadata,
						key: masterKey
					})
				)

				if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
					folderMetadata = {
						name: decrypted.name
					}

					if (this.sdk.config.metadataCache) {
						cache.folderMetadata.set(cacheKey, folderMetadata)
					}

					break
				}
			} catch {
				continue
			}
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
		const cacheKey = fastStringHash(metadata)

		if (this.sdk.config.metadataCache && cache.fileMetadata.has(cacheKey)) {
			return cache.fileMetadata.get(cacheKey)!
		}

		let fileMetadata: FileMetadata = {
			name: "",
			size: 1,
			mime: "application/octet-stream",
			key: "",
			lastModified: Date.now(),
			creation: undefined,
			hash: undefined
		}

		const privateKey = key ? key : this.sdk.config.privateKey ?? ""

		if (privateKey.length === 0) {
			throw new Error("Invalid privateKey.")
		}

		try {
			const decrypted = JSON.parse(
				await this.metadataPrivate({
					metadata,
					privateKey
				})
			)

			if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
				const lastModifiedParsed = parseInt(decrypted.lastModified ?? Date.now())

				fileMetadata = {
					size: parseInt(decrypted.size ?? 0),
					lastModified: lastModifiedParsed > 0 ? convertTimestampToMs(lastModifiedParsed) : Date.now(),
					creation: typeof decrypted.creation === "number" ? convertTimestampToMs(parseInt(decrypted.creation)) : undefined,
					name: decrypted.name,
					key: decrypted.key,
					mime: decrypted.mime,
					hash: decrypted.hash
				}

				if (this.sdk.config.metadataCache) {
					cache.fileMetadata.set(cacheKey, fileMetadata)
				}
			}
		} catch {
			// Noop
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
		const cacheKey = fastStringHash(metadata)

		if (this.sdk.config.metadataCache && cache.folderMetadata.has(cacheKey)) {
			return cache.folderMetadata.get(cacheKey)!
		}

		let folderMetadata: FolderMetadata = {
			name: ""
		}

		const privateKey = key ? key : this.sdk.config.privateKey ?? ""

		if (privateKey.length === 0) {
			throw new Error("Invalid privateKey.")
		}

		try {
			const decrypted = JSON.parse(
				await this.metadataPrivate({
					metadata,
					privateKey
				})
			)

			if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
				folderMetadata = {
					name: decrypted.name
				}

				if (this.sdk.config.metadataCache) {
					cache.folderMetadata.set(cacheKey, folderMetadata)
				}
			}
		} catch {
			// Noop
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
		if (linkKey.length === 0) {
			throw new Error("Invalid linkKey.")
		}

		const cacheKey = fastStringHash(metadata)

		if (this.sdk.config.metadataCache && cache.fileMetadata.has(cacheKey)) {
			return cache.fileMetadata.get(cacheKey)!
		}

		let fileMetadata: FileMetadata = {
			name: "",
			size: 1,
			mime: "application/octet-stream",
			key: "",
			lastModified: Date.now(),
			creation: undefined,
			hash: undefined
		}

		try {
			const decrypted = JSON.parse(
				await this.metadata({
					metadata,
					key: linkKey
				})
			)

			if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
				const lastModifiedParsed = parseInt(decrypted.lastModified ?? Date.now())

				fileMetadata = {
					size: parseInt(decrypted.size ?? 0),
					lastModified: lastModifiedParsed > 0 ? convertTimestampToMs(lastModifiedParsed) : Date.now(),
					creation: typeof decrypted.creation === "number" ? convertTimestampToMs(parseInt(decrypted.creation)) : undefined,
					name: decrypted.name,
					key: decrypted.key,
					mime: decrypted.mime,
					hash: decrypted.hash
				}

				if (this.sdk.config.metadataCache) {
					cache.fileMetadata.set(cacheKey, fileMetadata)
				}
			}
		} catch {
			// Noop
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
		if (linkKey.length === 0) {
			throw new Error("Invalid linkKey.")
		}

		const cacheKey = fastStringHash(metadata)

		if (this.sdk.config.metadataCache && cache.folderMetadata.has(cacheKey)) {
			return cache.folderMetadata.get(cacheKey)!
		}

		let folderMetadata: FolderMetadata = {
			name: ""
		}

		try {
			const decrypted = JSON.parse(
				await this.metadata({
					metadata,
					key: linkKey
				})
			)

			if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
				folderMetadata = {
					name: decrypted.name
				}

				if (this.sdk.config.metadataCache) {
					cache.folderMetadata.set(cacheKey, folderMetadata)
				}
			}
		} catch {
			// Noop
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
		const cacheKey = fastStringHash(metadata)

		if (this.sdk.config.metadataCache && cache.folderLinkKey.has(cacheKey)) {
			return cache.folderLinkKey.get(cacheKey)!
		}

		const keysToUse = key ? [key] : this.sdk.config.masterKeys ?? []

		for (const masterKey of keysToUse) {
			try {
				const decrypted = await this.metadata({
					metadata,
					key: masterKey
				})

				if (typeof decrypted === "string" && decrypted.length > 16) {
					if (this.sdk.config.metadataCache) {
						cache.folderLinkKey.set(cacheKey, decrypted)
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
	public async chatKeyParticipant({ metadata, privateKey }: { metadata: string; privateKey: string }): Promise<string> {
		if (privateKey.length === 0) {
			throw new Error("Invalid privateKey.")
		}

		const cacheKey = fastStringHash(metadata)

		if (this.sdk.config.metadataCache && cache.chatKeyParticipant.has(cacheKey)) {
			return cache.chatKeyParticipant.get(cacheKey)!
		}

		const decrypted = await this.metadataPrivate({
			metadata,
			privateKey
		})

		const parsed = JSON.parse(decrypted)

		if (typeof parsed.key !== "string") {
			throw new Error("Could not decrypt chat key, malformed decrypted metadata")
		}

		if (this.sdk.config.metadataCache) {
			cache.chatKeyParticipant.set(cacheKey, parsed.key)
		}

		return parsed.key
	}

	/**
	 * Decrypts a chat encryption (symmetric) key.
	 *
	 * @public
	 * @async
	 * @param {{ metadata: string; key?: string }} param0
	 * @param {string} param0.metadata
	 * @param {string} param0.key
	 * @returns {Promise<string>}
	 */
	public async chatKeyOwner({ metadata, key }: { metadata: string; key?: string }): Promise<string> {
		const cacheKey = fastStringHash(metadata)

		if (this.sdk.config.metadataCache && cache.chatKeyOwner.has(cacheKey)) {
			return cache.chatKeyOwner.get(cacheKey)!
		}

		const keysToUse = key ? [key] : this.sdk.config.masterKeys ?? []

		for (const masterKey of keysToUse) {
			try {
				const decrypted = await this.metadata({
					metadata,
					key: masterKey
				})

				if (typeof decrypted !== "string") {
					continue
				}

				const parsed = JSON.parse(decrypted)

				if (typeof parsed.key !== "string") {
					continue
				}

				if (this.sdk.config.metadataCache) {
					cache.chatKeyOwner.set(cacheKey, parsed.key)
				}

				return parsed.key
			} catch {
				continue
			}
		}

		throw new Error("Could not decrypt chat key using master keys.")
	}

	/**
	 * Decrypt a chat message
	 * @date 2/20/2024 - 5:34:42 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		message: string
	 * 		key: string
	 * 	}} param0
	 * @param {string} param0.message
	 * @param {string} param0.key
	 * @returns {Promise<string>}
	 */
	public async chatMessage({ message, key }: { message: string; key: string }): Promise<string> {
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		const messageDecrypted = await this.metadata({
			metadata: message,
			key
		})

		const parsedMessage = JSON.parse(messageDecrypted)

		if (typeof parsedMessage.message !== "string") {
			return ""
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
		const cacheKey = fastStringHash(metadata)

		if (this.sdk.config.metadataCache && cache.noteKeyOwner.has(cacheKey)) {
			return cache.noteKeyOwner.get(cacheKey)!
		}

		const keysToUse = key ? [key] : this.sdk.config.masterKeys ?? []

		for (const masterKey of keysToUse) {
			try {
				const decrypted = JSON.parse(
					await this.metadata({
						metadata,
						key: masterKey
					})
				)

				if (decrypted && typeof decrypted.key === "string" && decrypted.key.length > 16) {
					if (this.sdk.config.metadataCache) {
						cache.noteKeyOwner.set(cacheKey, decrypted.key)
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
		if (privateKey.length === 0) {
			throw new Error("Invalid privateKey.")
		}

		const cacheKey = fastStringHash(metadata)

		if (this.sdk.config.metadataCache && cache.noteKeyParticipant.has(cacheKey)) {
			return cache.noteKeyParticipant.get(cacheKey)!
		}

		const decrypted = await this.metadataPrivate({
			metadata,
			privateKey
		})

		const parsed = JSON.parse(decrypted)

		if (typeof parsed.key !== "string") {
			throw new Error("Could not decrypt note key of participant, malformed decrypted metadata")
		}

		if (this.sdk.config.metadataCache) {
			cache.noteKeyParticipant.set(cacheKey, parsed.key)
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
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		const decrypted = await this.metadata({
			metadata: content,
			key
		})

		const parsed = JSON.parse(decrypted)

		if (typeof parsed.content !== "string") {
			return ""
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
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		const cacheKey = fastStringHash(title)

		if (this.sdk.config.metadataCache && cache.noteTitle.has(cacheKey)) {
			return cache.noteTitle.get(cacheKey)!
		}

		const decrypted = await this.metadata({
			metadata: title,
			key
		})

		const parsed = JSON.parse(decrypted)

		if (typeof parsed.title !== "string") {
			return ""
		}

		if (this.sdk.config.metadataCache) {
			cache.noteTitle.set(cacheKey, parsed.title)
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
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		const cacheKey = fastStringHash(preview)

		if (this.sdk.config.metadataCache && cache.notePreview.has(cacheKey)) {
			return cache.notePreview.get(cacheKey)!
		}

		const decrypted = await this.metadata({
			metadata: preview,
			key
		})

		const parsed = JSON.parse(decrypted)

		if (typeof parsed.preview !== "string") {
			return ""
		}

		if (this.sdk.config.metadataCache) {
			cache.notePreview.set(cacheKey, parsed.preview)
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
		const cacheKey = fastStringHash(name)

		if (this.sdk.config.metadataCache && cache.noteTagName.has(cacheKey)) {
			return cache.noteTagName.get(cacheKey)!
		}

		const keysToUse = key ? [key] : this.sdk.config.masterKeys ?? []

		for (const masterKey of keysToUse) {
			try {
				const decrypted = JSON.parse(
					await this.metadata({
						metadata: name,
						key: masterKey
					})
				)

				if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
					if (this.sdk.config.metadataCache) {
						cache.noteTagName.set(cacheKey, decrypted.name)
					}

					return decrypted.name
				}
			} catch {
				continue
			}
		}

		return ""
	}

	/**
	 * Decrypt a chat conversation name.
	 * @date 2/20/2024 - 5:31:41 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		name: string
	 * 		key: string
	 * 	}} param0
	 * @param {string} param0.name
	 * @param {string} param0.key
	 * @returns {Promise<string>}
	 */
	public async chatConversationName({ name, key }: { name: string; key: string }): Promise<string> {
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		const cacheKey = fastStringHash(name)

		if (this.sdk.config.metadataCache && cache.chatConversationName.has(cacheKey)) {
			return cache.chatConversationName.get(cacheKey)!
		}

		const nameDecrypted = await this.metadata({
			metadata: name,
			key
		})
		const parsed = JSON.parse(nameDecrypted)

		if (typeof parsed.name !== "string") {
			return ""
		}

		if (this.sdk.config.metadataCache) {
			cache.chatConversationName.set(cacheKey, parsed.name)
		}

		return parsed.name
	}

	/**
	 * Decrypt data.
	 * @date 2/7/2024 - 1:50:58 AM
	 *
	 * @public
	 * @async
	 * @param {{ data: Buffer; key: string; version: FileEncryptionVersion }} param0
	 * @param {Buffer} param0.data
	 * @param {string} param0.key
	 * @param {FileEncryptionVersion} param0.version
	 * @returns {Promise<Buffer>}
	 */
	public async data({ data, key, version }: { data: Buffer; key: string; version: FileEncryptionVersion }): Promise<Buffer> {
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		if (environment === "node" || environment === "react-native") {
			if (version === 1 || version === 1.5) {
				// Old and deprecated, not in use anymore, just here for backwards compatibility
				const firstBytes = data.subarray(0, 16)
				const asciiString = firstBytes.toString("ascii")
				const base64String = firstBytes.toString("base64")
				const utf8String = firstBytes.toString("utf-8")
				let needsConvert = true
				let isNormalCBC = true

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
					isNormalCBC = false
				}

				if (needsConvert && !isNormalCBC) {
					data = Buffer.from(Buffer.from(data).toString("utf-8"), "base64")
				}

				if (!isNormalCBC) {
					const { key: keyBytes, iv: ivBytes } = EVP_BytesToKey({
						password: Buffer.from(key, "utf-8"),
						salt: data.subarray(8, 16),
						keyBits: 256,
						ivLength: 16
					})
					const decipher = nodeCrypto.createDecipheriv("aes-256-cbc", keyBytes, ivBytes)
					const ciphertext = data.subarray(16)

					return Buffer.concat([decipher.update(ciphertext), decipher.final()])
				} else {
					const keyBytes = Buffer.from(key, "utf-8")
					const ivBytes = keyBytes.subarray(0, 16)
					const decipher = nodeCrypto.createDecipheriv("aes-256-cbc", keyBytes, ivBytes)

					return Buffer.concat([decipher.update(data), decipher.final()])
				}
			} else if (version === 2) {
				const iv = data.subarray(0, 12)
				const encData = data.subarray(12)
				const authTag = encData.subarray(-16)
				const ciphertext = encData.subarray(0, encData.byteLength - 16)
				const decipher = nodeCrypto.createDecipheriv("aes-256-gcm", Buffer.from(key, "utf-8"), iv)

				decipher.setAuthTag(authTag)

				return Buffer.concat([decipher.update(ciphertext), decipher.final()])
			} else if (version === 3) {
				// Version 3 requires the key to be a 32 bytes hex string (64 characters)
				if (key.length !== 64) {
					throw new Error(`[crypto.decrypt.data] Invalid key length ${key.length}. Expected 64 (hex).`)
				}

				const iv = data.subarray(0, 12)
				const encData = data.subarray(12)
				const authTag = encData.subarray(-16)
				const ciphertext = encData.subarray(0, encData.byteLength - 16)
				const decipher = nodeCrypto.createDecipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv)

				decipher.setAuthTag(authTag)

				return Buffer.concat([decipher.update(ciphertext), decipher.final()])
			} else {
				throw new Error(`[crypto.decrypt.data] Invalid version ${version}`)
			}
		} else if (environment === "browser") {
			if (version === 1 || version === 1.5) {
				// Old and deprecated, not in use anymore, just here for backwards compatibility
				const firstBytes = Buffer.from(data.subarray(0, 16))
				const asciiString = firstBytes.toString("ascii")
				const base64String = firstBytes.toString("base64")
				const utf8String = firstBytes.toString("utf-8")
				let needsConvert = true
				let isNormalCBC = true

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
					isNormalCBC = false
				}

				if (needsConvert && !isNormalCBC) {
					data = Buffer.from(Buffer.from(data).toString("utf-8"), "base64")
				}

				if (!isNormalCBC) {
					// Old and deprecated, not in use anymore, just here for backwards compatibility
					const saltBytes = Buffer.from(data.subarray(8, 16))

					const { key: keyBytes, iv: ivBytes } = EVP_BytesToKey({
						password: Buffer.from(key, "utf-8"),
						salt: saltBytes,
						keyBits: 256,
						ivLength: 16
					})

					const decrypted = await globalThis.crypto.subtle.decrypt(
						{
							name: "AES-CBC",
							iv: ivBytes
						},
						await importRawKey({
							key: keyBytes,
							algorithm: "AES-CBC",
							mode: ["decrypt"]
						}),
						data.subarray(16)
					)

					return Buffer.from(decrypted)
				} else {
					// Old and deprecated, not in use anymore, just here for backwards compatibility
					const keyBytes = Buffer.from(key, "utf-8")
					const ivBytes = keyBytes.subarray(0, 16)

					const decrypted = await globalThis.crypto.subtle.decrypt(
						{
							name: "AES-CBC",
							iv: ivBytes
						},
						await importRawKey({
							key: keyBytes,
							algorithm: "AES-CBC",
							mode: ["decrypt"]
						}),
						data
					)

					return Buffer.from(decrypted)
				}
			} else if (version === 2) {
				const iv = data.subarray(0, 12)
				const encData = data.subarray(12)
				const keyBytes = Buffer.from(key, "utf-8")
				const decrypted = await globalThis.crypto.subtle.decrypt(
					{
						name: "AES-GCM",
						iv
					},
					await importRawKey({
						key: keyBytes,
						algorithm: "AES-GCM",
						mode: ["decrypt"]
					}),
					encData
				)

				return Buffer.from(decrypted)
			} else if (version === 3) {
				// Version 3 requires the key to be a 32 bytes hex string (64 characters)
				if (key.length !== 64) {
					throw new Error(`[crypto.decrypt.data] Invalid key length ${key.length}. Expected 64 (hex).`)
				}

				const iv = data.subarray(0, 12)
				const encData = data.subarray(12)
				const keyBuffer = Buffer.from(key, "hex")
				const decrypted = await globalThis.crypto.subtle.decrypt(
					{
						name: "AES-GCM",
						iv
					},
					await importRawKey({
						key: keyBuffer,
						algorithm: "AES-GCM",
						mode: ["decrypt"]
					}),
					encData
				)

				return Buffer.from(decrypted)
			} else {
				throw new Error(`[crypto.decrypt.data] Invalid version ${version}`)
			}
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
		if (key.length === 0) {
			throw new Error("Invalid key.")
		}

		if (environment !== "node") {
			throw new Error(`crypto.decrypt.dataStream not implemented for ${environment} environment`)
		}

		let input = normalizePath(inputFile)
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

		const inputStat = await fs.stat(input)

		if (inputStat.size < (version === 1 || version === 1.5 ? 17 : 13)) {
			throw new Error(`Input file size too small: ${inputStat.size}.`)
		}

		let inputHandle = await fs.open(input, fs.constants.R_OK)
		let decipher: nodeCrypto.Decipher | nodeCrypto.DecipherGCM
		let bytesToSkipAtStartOfInputStream = 0
		let bytesToSkipAtEndOfInputStream = 0
		let inputFileSize = 0

		try {
			if (version === 1 || version === 1.5) {
				// Old and deprecated, not in use anymore, just here for backwards compatibility
				const firstBytes = Buffer.alloc(16)

				await fs.read(inputHandle, firstBytes, 0, 16, 0)

				if (firstBytes.byteLength === 0) {
					throw new Error("Could not read input file.")
				}

				const asciiString = firstBytes.toString("ascii")
				const base64String = firstBytes.toString("base64")
				const utf8String = firstBytes.toString("utf-8")
				let needsConvert = true
				let isNormalCBC = true

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
					isNormalCBC = false
				}

				if (needsConvert && !isNormalCBC) {
					const inputConverted = pathModule.join(pathModule.dirname(output), await uuidv4())

					await fs.rm(inputConverted, {
						force: true,
						maxRetries: 60 * 10,
						recursive: true,
						retryDelay: 100
					})

					await fs.close(inputHandle)

					const oldInput = `${input}`

					input = await streamDecodeBase64({
						inputFile: input,
						outputFile: inputConverted
					})

					inputHandle = await fs.open(input, fs.constants.R_OK)

					await fs.rm(oldInput, {
						force: true,
						maxRetries: 60 * 10,
						recursive: true,
						retryDelay: 100
					})
				}

				if (!isNormalCBC) {
					// Old and deprecated, not in use anymore, just here for backwards compatibility
					const saltBytes = Buffer.alloc(8)

					await fs.read(inputHandle, saltBytes, 0, 8, 8)

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
					// Old and deprecated, not in use anymore, just here for backwards compatibility
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

				await Promise.all([fs.read(inputHandle, ivBytes, 0, 12, 0), fs.read(inputHandle, authTagBytes, 0, 16, stat.size - 16)])

				if (ivBytes.byteLength === 0 || authTagBytes.byteLength === 0) {
					throw new Error("Could not read input file.")
				}

				decipher = nodeCrypto.createDecipheriv("aes-256-gcm", keyBytes, ivBytes).setAuthTag(authTagBytes)

				bytesToSkipAtStartOfInputStream = 12
				bytesToSkipAtEndOfInputStream = 16
				inputFileSize = stat.size
			} else if (version === 3) {
				// Version 3 requires the key to be a 32 bytes hex string (64 characters)
				if (key.length !== 64) {
					throw new Error(`[crypto.decrypt.data] Invalid key length ${key.length}. Expected 64 (hex).`)
				}

				const keyBytes = Buffer.from(key, "hex")
				const ivBytes = Buffer.alloc(12)
				const authTagBytes = Buffer.alloc(16)
				const stat = await fs.stat(input)

				await Promise.all([fs.read(inputHandle, ivBytes, 0, 12, 0), fs.read(inputHandle, authTagBytes, 0, 16, stat.size - 16)])

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

		const readStream = fs.createReadStream(normalizePath(input), {
			highWaterMark: BUFFER_SIZE,
			end: inputFileSize > 0 && bytesToSkipAtEndOfInputStream > 0 ? inputFileSize - bytesToSkipAtEndOfInputStream - 1 : Infinity,
			start: bytesToSkipAtStartOfInputStream
		})

		const writeStream = fs.createWriteStream(normalizePath(output))

		await new Promise<void>((resolve, reject) => {
			pipeline(readStream, decipher, writeStream, err => {
				if (err) {
					reject(err)

					return
				}

				resolve()
			})
		})

		return output
	}

	/**
	 * Decrypt a user event.
	 *
	 * @public
	 * @async
	 * @param {{ event: UserEvent }} param0
	 * @param {UserEvent} param0.event
	 * @returns {Promise<UserEvent>}
	 */
	public async event({ event }: { event: UserEvent }): Promise<UserEvent> {
		if (
			event.type === "fileUploaded" ||
			event.type === "versionedFileRestored" ||
			event.type === "fileMoved" ||
			event.type === "fileTrash" ||
			event.type === "fileRm" ||
			event.type === "fileRestored" ||
			event.type === "fileLinkEdited" ||
			event.type === "fileVersioned" ||
			event.type === "deleteFilePermanently"
		) {
			const metadataDecrypted = await this.fileMetadata({
				metadata: event.info.metadata
			})

			return {
				...event,
				info: {
					...event.info,
					metadataDecrypted:
						metadataDecrypted.name.length > 0
							? metadataDecrypted
							: {
									name: `CANNOT_DECRYPT_NAME_${event.uuid}`,
									size: 1,
									lastModified: Date.now(),
									key: "",
									creation: undefined,
									hash: undefined,
									mime: "application/octet-stream"
							  }
				}
			}
		} else if (event.type === "fileRenamed" || event.type === "fileMetadataChanged") {
			const [decryptedMetadata, oldDecryptedMetadata] = await Promise.all([
				this.fileMetadata({
					metadata: event.info.metadata
				}),
				this.fileMetadata({
					metadata: event.info.oldMetadata
				})
			])

			return {
				...event,
				info: {
					...event.info,
					metadataDecrypted:
						decryptedMetadata.name.length > 0
							? decryptedMetadata
							: {
									name: `CANNOT_DECRYPT_NAME_${event.uuid}`,
									size: 1,
									lastModified: Date.now(),
									key: "",
									creation: undefined,
									hash: undefined,
									mime: "application/octet-stream"
							  },
					oldMetadataDecrypted:
						oldDecryptedMetadata.name.length > 0
							? oldDecryptedMetadata
							: {
									name: `CANNOT_DECRYPT_NAME_${event.uuid}`,
									size: 1,
									lastModified: Date.now(),
									key: "",
									creation: undefined,
									hash: undefined,
									mime: "application/octet-stream"
							  }
				}
			}
		} else if (event.type === "fileShared") {
			const metadataDecrypted = await this.fileMetadata({
				metadata: event.info.metadata
			})

			return {
				...event,
				info: {
					...event.info,
					metadataDecrypted:
						metadataDecrypted.name.length > 0
							? metadataDecrypted
							: {
									name: `CANNOT_DECRYPT_NAME_${event.uuid}`,
									size: 1,
									lastModified: Date.now(),
									key: "",
									creation: undefined,
									hash: undefined,
									mime: "application/octet-stream"
							  }
				}
			}
		} else if (
			event.type === "subFolderCreated" ||
			event.type === "folderTrash" ||
			event.type === "folderMoved" ||
			event.type === "baseFolderCreated" ||
			event.type === "folderRestored" ||
			event.type === "folderColorChanged" ||
			event.type === "deleteFolderPermanently"
		) {
			const nameDecrypted = await this.folderMetadata({
				metadata: event.info.name
			})

			return {
				...event,
				info: {
					...event.info,
					nameDecrypted:
						nameDecrypted.name.length > 0
							? nameDecrypted
							: {
									name: `CANNOT_DECRYPT_NAME_${event.uuid}`
							  }
				}
			}
		} else if (event.type === "folderShared") {
			const nameDecrypted = await this.folderMetadata({
				metadata: event.info.name
			})

			return {
				...event,
				info: {
					...event.info,
					nameDecrypted:
						nameDecrypted.name.length > 0
							? nameDecrypted
							: {
									name: `CANNOT_DECRYPT_NAME_${event.uuid}`
							  }
				}
			}
		} else if (event.type === "itemFavorite") {
			const [folderDecrypted, fileDecrypted] = await Promise.all([
				this.folderMetadata({
					metadata: event.info.metadata
				}),
				this.fileMetadata({
					metadata: event.info.metadata
				})
			])

			return {
				...event,
				info: {
					...event.info,
					metadataDecrypted: fileDecrypted.name.length > 0 ? fileDecrypted : null,
					nameDecrypted: folderDecrypted.name.length > 0 ? folderDecrypted : null
				}
			}
		} else if (event.type === "folderRenamed" || event.type === "folderMetadataChanged") {
			const [decryptedMetadata, oldDecryptedMetadata] = await Promise.all([
				this.folderMetadata({
					metadata: event.info.name
				}),
				this.folderMetadata({
					metadata: event.info.oldName
				})
			])

			return {
				...event,
				info: {
					...event.info,
					nameDecrypted:
						decryptedMetadata.name.length > 0
							? decryptedMetadata
							: {
									name: `CANNOT_DECRYPT_NAME_${event.uuid}`
							  },
					oldNameDecrypted:
						oldDecryptedMetadata.name.length > 0
							? oldDecryptedMetadata
							: {
									name: `CANNOT_DECRYPT_NAME_${event.uuid}`
							  }
				}
			}
		}

		return event
	}
}

export default Decrypt
