"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Decrypt = void 0;
const constants_1 = require("../constants");
const utils_1 = require("./utils");
const crypto_1 = __importDefault(require("crypto"));
const utils_2 = require("../utils");
const cache_1 = __importDefault(require("../cache"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const base64_1 = require("../streams/base64");
const stream_1 = require("stream");
const util_1 = require("util");
const crypto_js_1 = __importDefault(require("crypto-js"));
const semaphore_1 = require("../semaphore");
const pipelineAsync = (0, util_1.promisify)(stream_1.pipeline);
/**
 * Decrypt
 * @date 1/31/2024 - 6:36:57 PM
 *
 * @export
 * @class Decrypt
 * @typedef {Decrypt}
 */
class Decrypt {
    /**
     * Creates an instance of Decrypt.
     * @date 1/31/2024 - 3:59:10 PM
     *
     * @constructor
     * @public
     * @param {CryptoConfig} params
     */
    constructor(params) {
        this.textDecoder = new TextDecoder();
        this._semaphores = {
            metadata: new semaphore_1.Semaphore(256),
            data: new semaphore_1.Semaphore(128)
        };
        this.config = params;
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
    async metadata({ metadata, key }) {
        await this._semaphores.metadata.acquire();
        try {
            if (constants_1.environment === "reactNative") {
                return await globalThis.nodeThread.decryptMetadata({ data: metadata, key });
            }
            else {
                const sliced = metadata.slice(0, 8);
                if (sliced === "U2FsdGVk") {
                    // Old and deprecated, not in use anymore, just here for backwards compatibility
                    return crypto_js_1.default.AES.decrypt(metadata, key).toString(crypto_js_1.default.enc.Utf8);
                }
                else {
                    const version = metadata.slice(0, 3);
                    if (version === "002") {
                        const keyBuffer = await (0, utils_1.deriveKeyFromPassword)({
                            password: key,
                            salt: key,
                            iterations: 1,
                            hash: "sha512",
                            bitLength: 256,
                            returnHex: false
                        });
                        const ivBuffer = Buffer.from(metadata.slice(3, 15), "utf-8");
                        const encrypted = Buffer.from(metadata.slice(15), "base64");
                        if (constants_1.environment === "node") {
                            const authTag = encrypted.subarray(-16);
                            const cipherText = encrypted.subarray(0, encrypted.byteLength - 16);
                            const decipher = crypto_1.default.createDecipheriv("aes-256-gcm", keyBuffer, ivBuffer);
                            decipher.setAuthTag(authTag);
                            return Buffer.concat([decipher.update(cipherText), decipher.final()]).toString("utf-8");
                        }
                        else if (constants_1.environment === "browser") {
                            const decrypted = await globalThis.crypto.subtle.decrypt({
                                name: "AES-GCM",
                                iv: ivBuffer
                            }, await (0, utils_1.importRawKey)({ key, algorithm: "AES-GCM", mode: ["decrypt"] }), encrypted);
                            return Buffer.from(decrypted).toString("utf-8");
                        }
                        else if (constants_1.environment === "reactNative") {
                            return await global.nodeThread.decryptMetadata({ data: metadata, key });
                        }
                        throw new Error(`crypto.decrypt.metadata is not implemented for ${constants_1.environment} environment`);
                    }
                    throw new Error(`[crypto.decrypt.metadata] Invalid metadata version ${version}`);
                }
            }
        }
        finally {
            this._semaphores.metadata.release();
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
    async metadataPrivate({ metadata, privateKey }) {
        await this._semaphores.metadata.acquire();
        try {
            if (constants_1.environment === "node") {
                const pemKey = await (0, utils_1.derKeyToPem)({ key: privateKey });
                const decrypted = crypto_1.default.privateDecrypt({
                    key: pemKey,
                    padding: crypto_1.default.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: "sha512"
                }, Buffer.from(metadata, "base64"));
                return decrypted.toString("utf-8");
            }
            else if (constants_1.environment === "browser") {
                const importedPrivateKey = await (0, utils_1.importPrivateKey)({ privateKey, mode: ["decrypt"] });
                const decrypted = await globalThis.crypto.subtle.decrypt({
                    name: "RSA-OAEP"
                }, importedPrivateKey, Buffer.from(metadata, "base64"));
                return this.textDecoder.decode(decrypted);
            }
            else if (constants_1.environment === "reactNative") {
                return await global.nodeThread.decryptMetadataPrivateKey({ data: metadata, privateKey });
            }
            throw new Error(`crypto.encrypt.metadataPrivate not implemented for ${constants_1.environment} environment`);
        }
        finally {
            this._semaphores.metadata.release();
        }
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
    async fileMetadata({ metadata, key }) {
        var _a, _b;
        const cacheKey = await (0, utils_1.bufferToHash)({ buffer: Buffer.from(metadata, "utf-8"), algorithm: "md5" });
        if (this.config.metadataCache && cache_1.default.fileMetadata.has(cacheKey)) {
            return cache_1.default.fileMetadata.get(cacheKey);
        }
        let fileMetadata = {
            name: "",
            size: 0,
            mime: "application/octet-stream",
            key: "",
            lastModified: Date.now(),
            creation: undefined,
            hash: undefined
        };
        const keysToUse = key ? [key] : this.config.masterKeys.reverse();
        for (const masterKey of keysToUse) {
            try {
                const decrypted = JSON.parse(await this.metadata({ metadata, key: masterKey }));
                if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
                    fileMetadata = Object.assign(Object.assign({}, decrypted), { size: parseInt((_a = decrypted.size) !== null && _a !== void 0 ? _a : 0), lastModified: (0, utils_2.convertTimestampToMs)(parseInt((_b = decrypted.lastModified) !== null && _b !== void 0 ? _b : Date.now())), creation: typeof decrypted.creation === "number" ? (0, utils_2.convertTimestampToMs)(parseInt(decrypted.creation)) : undefined });
                    if (this.config.metadataCache) {
                        cache_1.default.fileMetadata.set(cacheKey, fileMetadata);
                    }
                    break;
                }
            }
            catch (_c) {
                continue;
            }
        }
        return fileMetadata;
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
    async folderMetadata({ metadata, key }) {
        if (metadata === "default") {
            return {
                name: "Default"
            };
        }
        const cacheKey = await (0, utils_1.bufferToHash)({ buffer: Buffer.from(metadata, "utf-8"), algorithm: "md5" });
        if (this.config.metadataCache && cache_1.default.folderMetadata.has(cacheKey)) {
            return cache_1.default.folderMetadata.get(cacheKey);
        }
        let folderMetadata = {
            name: ""
        };
        const keysToUse = key ? [key] : this.config.masterKeys.reverse();
        for (const masterKey of keysToUse) {
            try {
                const decrypted = JSON.parse(await this.metadata({ metadata, key: masterKey }));
                if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
                    folderMetadata = Object.assign(Object.assign({}, folderMetadata), { name: decrypted.name });
                    if (this.config.metadataCache) {
                        cache_1.default.folderMetadata.set(cacheKey, folderMetadata);
                    }
                    break;
                }
            }
            catch (_a) {
                continue;
            }
        }
        return folderMetadata;
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
    async fileMetadataPrivate({ metadata, key }) {
        var _a, _b;
        const cacheKey = await (0, utils_1.bufferToHash)({ buffer: Buffer.from(metadata, "utf-8"), algorithm: "md5" });
        if (this.config.metadataCache && cache_1.default.fileMetadata.has(cacheKey)) {
            return cache_1.default.fileMetadata.get(cacheKey);
        }
        let fileMetadata = {
            name: "",
            size: 0,
            mime: "application/octet-stream",
            key: "",
            lastModified: Date.now(),
            creation: undefined,
            hash: undefined
        };
        const privateKey = key ? key : this.config.privateKey;
        const decrypted = JSON.parse(await this.metadataPrivate({ metadata, privateKey }));
        if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
            fileMetadata = Object.assign(Object.assign({}, decrypted), { size: parseInt((_a = decrypted.size) !== null && _a !== void 0 ? _a : 0), lastModified: (0, utils_2.convertTimestampToMs)(parseInt((_b = decrypted.lastModified) !== null && _b !== void 0 ? _b : Date.now())), creation: typeof decrypted.creation === "number" ? (0, utils_2.convertTimestampToMs)(parseInt(decrypted.creation)) : undefined });
            if (this.config.metadataCache) {
                cache_1.default.fileMetadata.set(cacheKey, fileMetadata);
            }
        }
        return fileMetadata;
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
    async folderMetadataPrivate({ metadata, key }) {
        const cacheKey = await (0, utils_1.bufferToHash)({ buffer: Buffer.from(metadata, "utf-8"), algorithm: "md5" });
        if (this.config.metadataCache && cache_1.default.folderMetadata.has(cacheKey)) {
            return cache_1.default.folderMetadata.get(cacheKey);
        }
        let folderMetadata = {
            name: ""
        };
        const privateKey = key ? key : this.config.privateKey;
        const decrypted = JSON.parse(await this.metadataPrivate({ metadata, privateKey }));
        if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
            folderMetadata = Object.assign(Object.assign({}, folderMetadata), { name: decrypted.name });
            if (this.config.metadataCache) {
                cache_1.default.folderMetadata.set(cacheKey, folderMetadata);
            }
        }
        return folderMetadata;
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
    async fileMetadataLink({ metadata, linkKey }) {
        var _a, _b;
        const cacheKey = await (0, utils_1.bufferToHash)({ buffer: Buffer.from(metadata, "utf-8"), algorithm: "md5" });
        if (this.config.metadataCache && cache_1.default.fileMetadata.has(cacheKey)) {
            return cache_1.default.fileMetadata.get(cacheKey);
        }
        let fileMetadata = {
            name: "",
            size: 0,
            mime: "application/octet-stream",
            key: "",
            lastModified: Date.now(),
            creation: undefined,
            hash: undefined
        };
        const decrypted = JSON.parse(await this.metadata({ metadata, key: linkKey }));
        if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
            fileMetadata = Object.assign(Object.assign({}, decrypted), { size: parseInt((_a = decrypted.size) !== null && _a !== void 0 ? _a : 0), lastModified: (0, utils_2.convertTimestampToMs)(parseInt((_b = decrypted.lastModified) !== null && _b !== void 0 ? _b : Date.now())), creation: typeof decrypted.creation === "number" ? (0, utils_2.convertTimestampToMs)(parseInt(decrypted.creation)) : undefined });
            if (this.config.metadataCache) {
                cache_1.default.fileMetadata.set(cacheKey, fileMetadata);
            }
        }
        return fileMetadata;
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
    async folderMetadataLink({ metadata, linkKey }) {
        const cacheKey = await (0, utils_1.bufferToHash)({ buffer: Buffer.from(metadata, "utf-8"), algorithm: "md5" });
        if (this.config.metadataCache && cache_1.default.folderMetadata.has(cacheKey)) {
            return cache_1.default.folderMetadata.get(cacheKey);
        }
        let folderMetadata = {
            name: ""
        };
        const decrypted = JSON.parse(await this.metadata({ metadata, key: linkKey }));
        if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
            folderMetadata = Object.assign(Object.assign({}, folderMetadata), { name: decrypted.name });
            if (this.config.metadataCache) {
                cache_1.default.folderMetadata.set(cacheKey, folderMetadata);
            }
        }
        if (folderMetadata.name.length === 0) {
            throw new Error("Could not decrypt folder metadata (link) using given key.");
        }
        return folderMetadata;
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
    async folderLinkKey({ metadata, key }) {
        const cacheKey = await (0, utils_1.bufferToHash)({ buffer: Buffer.from(metadata, "utf-8"), algorithm: "md5" });
        if (this.config.metadataCache && cache_1.default.folderLinkKey.has(cacheKey)) {
            return cache_1.default.folderLinkKey.get(cacheKey);
        }
        const keysToUse = key ? [key] : this.config.masterKeys.reverse();
        for (const masterKey of keysToUse) {
            try {
                const decrypted = JSON.parse(await this.metadata({ metadata, key: masterKey }));
                if (typeof decrypted === "string" && decrypted.length > 0) {
                    if (this.config.metadataCache) {
                        cache_1.default.folderLinkKey.set(cacheKey, decrypted);
                    }
                    return decrypted;
                }
            }
            catch (_a) {
                continue;
            }
        }
        throw new Error("Could not decrypt folder link key using given keys.");
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
    async chatKey({ metadata, privateKey }) {
        const cacheKey = await (0, utils_1.bufferToHash)({ buffer: Buffer.from(metadata, "utf-8"), algorithm: "md5" });
        if (this.config.metadataCache && cache_1.default.chatKey.has(cacheKey)) {
            return cache_1.default.chatKey.get(cacheKey);
        }
        const decrypted = await this.metadataPrivate({ metadata, privateKey });
        const parsed = JSON.parse(decrypted);
        if (typeof parsed.key !== "string") {
            throw new Error("Could not decrypt chat key, malformed decrypted metadata");
        }
        if (this.config.metadataCache) {
            cache_1.default.chatKey.set(cacheKey, parsed.key);
        }
        return parsed.key;
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
    async chatMessage({ message, key }) {
        const messageDecrypted = await this.metadata({ metadata: message, key });
        const parsedMessage = JSON.parse(messageDecrypted);
        if (typeof parsedMessage.message !== "string") {
            throw new Error("Could not decrypt chat message, malformed decrypted metadata");
        }
        return parsedMessage.message;
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
    async noteKeyOwner({ metadata, key }) {
        const cacheKey = await (0, utils_1.bufferToHash)({ buffer: Buffer.from(metadata, "utf-8"), algorithm: "md5" });
        if (this.config.metadataCache && cache_1.default.noteKeyOwner.has(cacheKey)) {
            return cache_1.default.noteKeyOwner.get(cacheKey);
        }
        const keysToUse = key ? [key] : this.config.masterKeys.reverse();
        for (const masterKey of keysToUse) {
            try {
                const decrypted = JSON.parse(await this.metadata({ metadata, key: masterKey }));
                if (decrypted && typeof decrypted.key === "string" && decrypted.key.length > 0) {
                    if (this.config.metadataCache) {
                        cache_1.default.noteKeyOwner.set(cacheKey, decrypted.key);
                    }
                    return decrypted.key;
                }
            }
            catch (_a) {
                continue;
            }
        }
        throw new Error("Could not decrypt note key (owner) using given metadata and keys");
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
    async noteKeyParticipant({ metadata, privateKey }) {
        const cacheKey = await (0, utils_1.bufferToHash)({ buffer: Buffer.from(metadata, "utf-8"), algorithm: "md5" });
        if (this.config.metadataCache && cache_1.default.noteKeyParticipant.has(cacheKey)) {
            return cache_1.default.noteKeyParticipant.get(cacheKey);
        }
        const decrypted = await this.metadataPrivate({ metadata, privateKey });
        const parsed = JSON.parse(decrypted);
        if (typeof parsed.key !== "string") {
            throw new Error("Could not decrypt note key of participant, malformed decrypted metadata");
        }
        if (this.config.metadataCache) {
            cache_1.default.noteKeyParticipant.set(cacheKey, parsed.key);
        }
        return parsed.key;
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
    async noteContent({ content, key }) {
        const decrypted = await this.metadata({ metadata: content, key });
        const parsed = JSON.parse(decrypted);
        if (typeof parsed.content !== "string") {
            throw new Error("Could not decrypt note content, malformed decrypted metadata");
        }
        return parsed.content;
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
    async noteTitle({ title, key }) {
        const cacheKey = await (0, utils_1.bufferToHash)({ buffer: Buffer.from(title, "utf-8"), algorithm: "md5" });
        if (this.config.metadataCache && cache_1.default.noteTitle.has(cacheKey)) {
            return cache_1.default.noteTitle.get(cacheKey);
        }
        const decrypted = await this.metadata({ metadata: title, key });
        const parsed = JSON.parse(decrypted);
        if (typeof parsed.title !== "string") {
            throw new Error("Could not decrypt note title, malformed decrypted metadata");
        }
        if (this.config.metadataCache) {
            cache_1.default.noteTitle.set(cacheKey, parsed.title);
        }
        return parsed.title;
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
    async notePreview({ preview, key }) {
        const cacheKey = await (0, utils_1.bufferToHash)({ buffer: Buffer.from(preview, "utf-8"), algorithm: "md5" });
        if (this.config.metadataCache && cache_1.default.notePreview.has(cacheKey)) {
            return cache_1.default.notePreview.get(cacheKey);
        }
        const decrypted = await this.metadata({ metadata: preview, key });
        const parsed = JSON.parse(decrypted);
        if (typeof parsed.preview !== "string") {
            throw new Error("Could not decrypt note preview, malformed decrypted metadata");
        }
        if (this.config.metadataCache) {
            cache_1.default.notePreview.set(cacheKey, parsed.preview);
        }
        return parsed.preview;
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
    async noteTagName({ name, key }) {
        const cacheKey = await (0, utils_1.bufferToHash)({ buffer: Buffer.from(name, "utf-8"), algorithm: "md5" });
        if (this.config.metadataCache && cache_1.default.noteTagName.has(cacheKey)) {
            return cache_1.default.noteTagName.get(cacheKey);
        }
        const keysToUse = key ? [key] : this.config.masterKeys.reverse();
        for (const masterKey of keysToUse) {
            try {
                const decrypted = JSON.parse(await this.metadata({ metadata: name, key: masterKey }));
                if (decrypted && typeof decrypted.name === "string" && decrypted.name.length > 0) {
                    if (this.config.metadataCache) {
                        cache_1.default.noteTagName.set(cacheKey, decrypted.name);
                    }
                    return decrypted.name;
                }
            }
            catch (_a) {
                continue;
            }
        }
        throw new Error("Could not decrypt note tag name using given metadata and keys");
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
    async chatConversationName({ name, key }) {
        const cacheKey = await (0, utils_1.bufferToHash)({ buffer: Buffer.from(name, "utf-8"), algorithm: "md5" });
        if (this.config.metadataCache && cache_1.default.chatConversationName.has(cacheKey)) {
            return cache_1.default.chatConversationName.get(cacheKey);
        }
        const nameDecrypted = await this.metadata({ metadata: name, key });
        const parsed = JSON.parse(nameDecrypted);
        if (typeof parsed.name !== "string") {
            throw new Error("Could not decrypt chat conversation name, malformed decrypted metadata");
        }
        if (this.config.metadataCache) {
            cache_1.default.chatConversationName.set(cacheKey, parsed.name);
        }
        return parsed.name;
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
    async data({ data, key, version }) {
        await this._semaphores.data.acquire();
        try {
            if (constants_1.environment === "node") {
                if (version === 1) {
                    // Old and deprecated, not in use anymore, just here for backwards compatibility
                    const firstBytes = Buffer.from(data.subarray(0, 16));
                    const asciiString = firstBytes.toString("ascii");
                    const base64String = firstBytes.toString("base64");
                    const utf8String = firstBytes.toString("utf-8");
                    let needsConvert = true;
                    let isCBC = true;
                    if (asciiString.startsWith("Salted_") || base64String.startsWith("Salted_") || utf8String.startsWith("Salted_")) {
                        needsConvert = false;
                    }
                    if (asciiString.startsWith("Salted_") ||
                        base64String.startsWith("Salted_") ||
                        utf8String.startsWith("U2FsdGVk") ||
                        asciiString.startsWith("U2FsdGVk") ||
                        utf8String.startsWith("Salted_") ||
                        base64String.startsWith("U2FsdGVk")) {
                        isCBC = false;
                    }
                    if (needsConvert && !isCBC) {
                        data = Buffer.from(this.textDecoder.decode(data), "base64");
                    }
                    if (!isCBC) {
                        // Old and deprecated, not in use anymore, just here for backwards compatibility
                        const saltBytes = Buffer.from(data.subarray(8, 16));
                        const { key: keyBytes, iv: ivBytes } = (0, utils_1.EVP_BytesToKey)({
                            password: Buffer.from(key, "utf-8"),
                            salt: saltBytes,
                            keyBits: 256,
                            ivLength: 16
                        });
                        const decipher = crypto_1.default.createDecipheriv("aes-256-cbc", keyBytes, ivBytes);
                        const ciphertext = data.subarray(16);
                        return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
                    }
                    else {
                        // Old and deprecated, not in use anymore, just here for backwards compatibility
                        const keyBytes = Buffer.from(key, "utf-8");
                        const ivBytes = keyBytes.subarray(0, 16);
                        const decipher = crypto_1.default.createDecipheriv("aes-256-cbc", keyBytes, ivBytes);
                        return Buffer.concat([decipher.update(data), decipher.final()]);
                    }
                }
                else if (version === 2) {
                    const iv = data.subarray(0, 12);
                    const encData = data.subarray(12);
                    const authTag = encData.subarray(-16);
                    const ciphertext = encData.subarray(0, encData.byteLength - 16);
                    const decipher = crypto_1.default.createDecipheriv("aes-256-gcm", Buffer.from(key, "utf-8"), iv);
                    decipher.setAuthTag(authTag);
                    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
                }
            }
            else if (constants_1.environment === "browser") {
                if (version === 1) {
                    // Old and deprecated, not in use anymore, just here for backwards compatibility
                    const firstBytes = Buffer.from(data.subarray(0, 16));
                    const asciiString = firstBytes.toString("ascii");
                    const base64String = firstBytes.toString("base64");
                    const utf8String = firstBytes.toString("utf-8");
                    let needsConvert = true;
                    let isCBC = true;
                    if (asciiString.startsWith("Salted_") || base64String.startsWith("Salted_") || utf8String.startsWith("Salted_")) {
                        needsConvert = false;
                    }
                    if (asciiString.startsWith("Salted_") ||
                        base64String.startsWith("Salted_") ||
                        utf8String.startsWith("U2FsdGVk") ||
                        asciiString.startsWith("U2FsdGVk") ||
                        utf8String.startsWith("Salted_") ||
                        base64String.startsWith("U2FsdGVk")) {
                        isCBC = false;
                    }
                    if (needsConvert && !isCBC) {
                        data = Buffer.from(this.textDecoder.decode(data), "base64");
                    }
                    if (!isCBC) {
                        // Old and deprecated, not in use anymore, just here for backwards compatibility
                        const saltBytes = Buffer.from(data.subarray(8, 16));
                        const { key: keyBytes, iv: ivBytes } = (0, utils_1.EVP_BytesToKey)({
                            password: Buffer.from(key, "utf-8"),
                            salt: saltBytes,
                            keyBits: 256,
                            ivLength: 16
                        });
                        const decrypted = await globalThis.crypto.subtle.decrypt({
                            name: "AES-CBC",
                            iv: ivBytes
                        }, await (0, utils_1.importRawKey)({ key: keyBytes.toString("utf-8"), algorithm: "AES-GCM", mode: ["decrypt"] }), data.subarray(16));
                        return Buffer.from(decrypted);
                    }
                    else {
                        // Old and deprecated, not in use anymore, just here for backwards compatibility
                        const keyBytes = Buffer.from(key, "utf-8");
                        const ivBytes = keyBytes.subarray(0, 16);
                        const decrypted = await globalThis.crypto.subtle.decrypt({
                            name: "AES-CBC",
                            iv: ivBytes
                        }, await (0, utils_1.importRawKey)({ key, algorithm: "AES-CBC", mode: ["decrypt"] }), data);
                        return Buffer.from(decrypted);
                    }
                }
                else if (version === 2) {
                    const iv = data.subarray(0, 12);
                    const encData = data.subarray(12);
                    const decrypted = await globalThis.crypto.subtle.decrypt({
                        name: "AES-GCM",
                        iv
                    }, await (0, utils_1.importRawKey)({ key, algorithm: "AES-GCM", mode: ["decrypt"] }), encData);
                    return Buffer.from(decrypted);
                }
            }
            else if (constants_1.environment === "reactNative") {
                return Buffer.from(await global.nodeThread.decryptData({ base64: Buffer.from(data).toString("base64"), key, version }));
            }
            throw new Error(`crypto.decrypt.data not implemented for ${constants_1.environment} environment`);
        }
        finally {
            this._semaphores.data.release();
        }
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
    async dataStream({ inputFile, key, version, outputFile }) {
        await this._semaphores.data.acquire();
        try {
            if (constants_1.environment !== "node") {
                throw new Error(`crypto.decrypt.dataStream not implemented for ${constants_1.environment} environment`);
            }
            let input = (0, utils_2.normalizePath)(inputFile);
            const output = (0, utils_2.normalizePath)(outputFile ? outputFile : path_1.default.join(this.config.tmpPath, await (0, utils_2.uuidv4)()));
            if (!(await fs_extra_1.default.exists(input))) {
                throw new Error("Input file does not exist.");
            }
            await fs_extra_1.default.rm(output, {
                force: true,
                maxRetries: 60 * 10,
                recursive: true,
                retryDelay: 100
            });
            const inputStat = await fs_extra_1.default.stat(input);
            if (inputStat.size < (version === 1 ? 17 : 13)) {
                throw new Error(`Input file size too small: ${inputStat.size}.`);
            }
            let inputHandle = await fs_extra_1.default.open(input, fs_extra_1.default.constants.R_OK);
            let decipher;
            let bytesToSkipAtStartOfInputStream = 0;
            let bytesToSkipAtEndOfInputStream = 0;
            let inputFileSize = 0;
            try {
                if (version === 1) {
                    // Old and deprecated, not in use anymore, just here for backwards compatibility
                    const firstBytes = Buffer.alloc(16);
                    await fs_extra_1.default.read(inputHandle, firstBytes, 0, 16, 0);
                    if (firstBytes.byteLength === 0) {
                        throw new Error("Could not read input file.");
                    }
                    const asciiString = firstBytes.toString("ascii");
                    const base64String = firstBytes.toString("base64");
                    const utf8String = firstBytes.toString("utf-8");
                    let needsConvert = true;
                    let isCBC = true;
                    if (asciiString.startsWith("Salted_") || base64String.startsWith("Salted_") || utf8String.startsWith("Salted_")) {
                        needsConvert = false;
                    }
                    if (asciiString.startsWith("Salted_") ||
                        base64String.startsWith("Salted_") ||
                        utf8String.startsWith("U2FsdGVk") ||
                        asciiString.startsWith("U2FsdGVk") ||
                        utf8String.startsWith("Salted_") ||
                        base64String.startsWith("U2FsdGVk")) {
                        isCBC = false;
                    }
                    if (needsConvert && !isCBC) {
                        const inputConverted = path_1.default.join(path_1.default.dirname(output), await (0, utils_2.uuidv4)());
                        await fs_extra_1.default.rm(inputConverted, {
                            force: true,
                            maxRetries: 60 * 10,
                            recursive: true,
                            retryDelay: 100
                        });
                        await fs_extra_1.default.close(inputHandle);
                        const oldInput = `${input}`;
                        input = await (0, base64_1.streamDecodeBase64)({ inputFile: input, outputFile: inputConverted });
                        inputHandle = await fs_extra_1.default.open(input, fs_extra_1.default.constants.R_OK);
                        await fs_extra_1.default.rm(oldInput, {
                            force: true,
                            maxRetries: 60 * 10,
                            recursive: true,
                            retryDelay: 100
                        });
                    }
                    if (!isCBC) {
                        // Old and deprecated, not in use anymore, just here for backwards compatibility
                        const saltBytes = Buffer.alloc(8);
                        await fs_extra_1.default.read(inputHandle, saltBytes, 0, 8, 8);
                        const { key: keyBytes, iv: ivBytes } = (0, utils_1.EVP_BytesToKey)({
                            password: Buffer.from(key, "utf-8"),
                            salt: saltBytes,
                            keyBits: 256,
                            ivLength: 16
                        });
                        decipher = crypto_1.default.createDecipheriv("aes-256-cbc", keyBytes, ivBytes);
                        bytesToSkipAtStartOfInputStream = 16;
                        bytesToSkipAtEndOfInputStream = 0;
                    }
                    else {
                        // Old and deprecated, not in use anymore, just here for backwards compatibility
                        const keyBytes = Buffer.from(key, "utf-8");
                        const ivBytes = keyBytes.subarray(0, 16);
                        decipher = crypto_1.default.createDecipheriv("aes-256-cbc", keyBytes, ivBytes);
                        bytesToSkipAtStartOfInputStream = 0;
                        bytesToSkipAtEndOfInputStream = 0;
                    }
                }
                else if (version === 2) {
                    const keyBytes = Buffer.from(key, "utf-8");
                    const ivBytes = Buffer.alloc(12);
                    const authTagBytes = Buffer.alloc(16);
                    const stat = await fs_extra_1.default.stat(input);
                    await Promise.all([fs_extra_1.default.read(inputHandle, ivBytes, 0, 12, 0), fs_extra_1.default.read(inputHandle, authTagBytes, 0, 16, stat.size - 16)]);
                    if (ivBytes.byteLength === 0 || authTagBytes.byteLength === 0) {
                        throw new Error("Could not read input file.");
                    }
                    decipher = crypto_1.default.createDecipheriv("aes-256-gcm", keyBytes, ivBytes).setAuthTag(authTagBytes);
                    bytesToSkipAtStartOfInputStream = 12;
                    bytesToSkipAtEndOfInputStream = 16;
                    inputFileSize = stat.size;
                }
                else {
                    throw new Error(`Invalid FileEncryptionVersion: ${version}`);
                }
            }
            finally {
                await fs_extra_1.default.close(inputHandle);
            }
            const readStream = fs_extra_1.default.createReadStream((0, utils_2.normalizePath)(input), {
                highWaterMark: constants_1.BUFFER_SIZE,
                end: inputFileSize > 0 && bytesToSkipAtEndOfInputStream > 0 ? inputFileSize - bytesToSkipAtEndOfInputStream - 1 : Infinity,
                start: bytesToSkipAtStartOfInputStream
            });
            const writeStream = fs_extra_1.default.createWriteStream((0, utils_2.normalizePath)(output));
            await pipelineAsync(readStream, decipher, writeStream);
            return output;
        }
        finally {
            this._semaphores.data.release();
        }
    }
}
exports.Decrypt = Decrypt;
exports.default = Decrypt;
//# sourceMappingURL=decrypt.js.map