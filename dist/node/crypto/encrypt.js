"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encrypt = void 0;
const constants_1 = require("../constants");
const os_1 = __importDefault(require("os"));
const crypto_1 = __importDefault(require("crypto"));
const utils_1 = require("./utils");
const utils_2 = require("../utils");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const stream_1 = require("stream");
const util_1 = require("util");
const pipelineAsync = (0, util_1.promisify)(stream_1.pipeline);
/**
 * Encrypt
 * @date 2/1/2024 - 2:44:28 AM
 *
 * @export
 * @class Encrypt
 * @typedef {Encrypt}
 */
class Encrypt {
    /**
     * Creates an instance of Encrypt.
     *
     * @constructor
     * @public
     * @param {FilenSDK} sdk
     */
    constructor(sdk) {
        this.sdk = sdk;
    }
    /**
     * Encrypt metadata using the user's DEK or a provided key.
     *
     * @public
     * @async
     * @param {{
     * 		metadata: string
     * 		key?: string
     * 		version?: MetadataEncryptionVersion
     * 	}} param0
     * @param {string} param0.metadata
     * @param {string} param0.key
     * @param {MetadataEncryptionVersion} [param0.version=METADATA_ENCRYPTION_VERSION]
     * @returns {Promise<string>}
     */
    async metadata({ metadata, key, version = constants_1.METADATA_ENCRYPTION_VERSION }) {
        const keyToUse = key ? key : this.sdk.config.masterKeys ? this.sdk.config.masterKeys.at(-1) : undefined;
        if (!keyToUse) {
            throw new Error("crypto.encrypt.metadata no key to use.");
        }
        // If the key provided is not a 64 char hex encoded key, we cannot use it with v3. Downgrade to v2.
        if (version === 3 && (keyToUse.length !== 64 || !(0, utils_2.isValidHexString)(keyToUse))) {
            version = 2;
        }
        if (version === 2) {
            const iv = await (0, utils_1.generateRandomString)(12);
            const ivBuffer = Buffer.from(iv, "utf-8");
            if (constants_1.environment === "node") {
                const derivedKey = await (0, utils_1.deriveKeyFromPassword)({
                    password: keyToUse,
                    salt: keyToUse,
                    iterations: 1,
                    hash: "sha512",
                    bitLength: 256,
                    returnHex: false
                });
                const dataBuffer = Buffer.from(metadata, "utf-8");
                const cipher = crypto_1.default.createCipheriv("aes-256-gcm", derivedKey, ivBuffer);
                const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
                const authTag = cipher.getAuthTag();
                return `002${iv}${Buffer.concat([encrypted, authTag]).toString("base64")}`;
            }
            else if (constants_1.environment === "browser") {
                const derivedKey = await (0, utils_1.deriveKeyFromPassword)({
                    password: keyToUse,
                    salt: keyToUse,
                    iterations: 1,
                    hash: "sha512",
                    bitLength: 256,
                    returnHex: false
                });
                const dataBuffer = Buffer.from(metadata, "utf-8");
                const encrypted = await globalThis.crypto.subtle.encrypt({
                    name: "AES-GCM",
                    iv: ivBuffer
                }, await (0, utils_1.importRawKey)({
                    key: derivedKey,
                    algorithm: "AES-GCM",
                    mode: ["encrypt"],
                    keyCache: false
                }), dataBuffer);
                return `002${iv}${Buffer.from(encrypted).toString("base64")}`;
            }
            else {
                throw new Error(`crypto.encrypt.metadata not implemented for ${constants_1.environment} environment`);
            }
        }
        else if (version === 3) {
            if (keyToUse.length !== 64) {
                throw new Error("v3 metadata encryption requires 64 char hex key.");
            }
            const ivBuffer = await (0, utils_1.generateRandomBytes)(12);
            const keyBuffer = Buffer.from(keyToUse, "hex");
            if (constants_1.environment === "node") {
                const dataBuffer = Buffer.from(metadata, "utf-8");
                const cipher = crypto_1.default.createCipheriv("aes-256-gcm", keyBuffer, ivBuffer);
                const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
                const authTag = cipher.getAuthTag();
                return `003${ivBuffer.toString("hex")}${Buffer.concat([encrypted, authTag]).toString("base64")}`;
            }
            else if (constants_1.environment === "browser") {
                const dataBuffer = Buffer.from(metadata, "utf-8");
                const encrypted = await globalThis.crypto.subtle.encrypt({
                    name: "AES-GCM",
                    iv: ivBuffer
                }, await (0, utils_1.importRawKey)({
                    key: keyBuffer,
                    algorithm: "AES-GCM",
                    mode: ["encrypt"],
                    keyCache: false
                }), dataBuffer);
                return `003${ivBuffer.toString("hex")}${Buffer.from(encrypted).toString("base64")}`;
            }
            else {
                throw new Error(`crypto.encrypt.metadata not implemented for ${constants_1.environment} environment`);
            }
        }
        else {
            throw new Error(`crypto.encrypt.metadata invalid version ${version}`);
        }
    }
    /**
     * Encrypts metadata using a public key.
     *
     * @public
     * @async
     * @param {{ metadata: string; publicKey: string }} param0
     * @param {string} param0.metadata
     * @param {string} param0.publicKey
     * @returns {Promise<string>}
     */
    async metadataPublic({ metadata, publicKey }) {
        if (constants_1.environment === "node") {
            const pemKey = await (0, utils_1.derKeyToPem)({
                key: publicKey
            });
            const encrypted = crypto_1.default.publicEncrypt({
                key: pemKey,
                padding: crypto_1.default.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha512"
            }, Buffer.from(metadata, "utf-8"));
            return Buffer.from(encrypted).toString("base64");
        }
        else if (constants_1.environment === "browser") {
            const importedPublicKey = await (0, utils_1.importPublicKey)({
                publicKey,
                mode: ["encrypt"]
            });
            const encrypted = await globalThis.crypto.subtle.encrypt({
                name: "RSA-OAEP"
            }, importedPublicKey, Buffer.from(metadata, "utf-8"));
            return Buffer.from(encrypted).toString("base64");
        }
        throw new Error(`crypto.encrypt.metadataPublic not implemented for ${constants_1.environment} environment`);
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
    async chatMessage({ message, key }) {
        if (key.length === 0) {
            throw new Error("Invalid key.");
        }
        return await this.metadata({
            metadata: JSON.stringify({
                message
            }),
            key
        });
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
    async noteContent({ content, key }) {
        if (key.length === 0) {
            throw new Error("Invalid key.");
        }
        return await this.metadata({
            metadata: JSON.stringify({
                content
            }),
            key
        });
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
    async noteTitle({ title, key }) {
        if (key.length === 0) {
            throw new Error("Invalid key.");
        }
        return await this.metadata({
            metadata: JSON.stringify({
                title
            }),
            key
        });
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
    async notePreview({ preview, key }) {
        if (key.length === 0) {
            throw new Error("Invalid key.");
        }
        return await this.metadata({
            metadata: JSON.stringify({ preview }),
            key
        });
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
    async noteTagName({ name, key }) {
        const keyToUse = key ? key : this.sdk.config.masterKeys ? this.sdk.config.masterKeys.at(-1) : undefined;
        if (keyToUse.length === 0) {
            throw new Error("Invalid key.");
        }
        return await this.metadata({
            metadata: JSON.stringify({
                name
            }),
            key: keyToUse
        });
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
    async chatConversationName({ name, key }) {
        if (key.length === 0) {
            throw new Error("Invalid key.");
        }
        return await this.metadata({
            metadata: JSON.stringify({
                name
            }),
            key
        });
    }
    async data({ data, key, version = constants_1.FILE_ENCRYPTION_VERSION }) {
        if (key.length === 0) {
            throw new Error("Invalid key.");
        }
        // If the key provided is not a 64 char hex encoded key, we cannot use it with v3. Downgrade to v2.
        if (version === 3 && (key.length !== 64 || !(0, utils_2.isValidHexString)(key))) {
            version = 2;
        }
        if (version === 2) {
            if (key.length !== 32) {
                throw new Error("v2 file encryption requires 32 char ascii key.");
            }
            const iv = await (0, utils_1.generateRandomString)(12);
            const ivBuffer = Buffer.from(iv, "utf-8");
            if (constants_1.environment === "node") {
                const cipher = crypto_1.default.createCipheriv("aes-256-gcm", Buffer.from(key, "utf-8"), ivBuffer);
                const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
                const authTag = cipher.getAuthTag();
                const ciphertext = Buffer.concat([encrypted, authTag]);
                return Buffer.concat([ivBuffer, ciphertext]);
            }
            else if (constants_1.environment === "browser") {
                const encrypted = await globalThis.crypto.subtle.encrypt({
                    name: "AES-GCM",
                    iv: ivBuffer
                }, await (0, utils_1.importRawKey)({
                    key: Buffer.from(key, "utf-8"),
                    algorithm: "AES-GCM",
                    mode: ["encrypt"],
                    keyCache: false
                }), data);
                return Buffer.concat([ivBuffer, new Uint8Array(encrypted)]);
            }
            else {
                throw new Error(`crypto.decrypt.data not implemented for ${constants_1.environment} environment`);
            }
        }
        else if (version === 3) {
            if (key.length !== 64) {
                throw new Error("v3 file encryption requires 64 char hex key.");
            }
            const ivBuffer = await (0, utils_1.generateRandomBytes)(12);
            const keyBuffer = Buffer.from(key, "hex");
            if (constants_1.environment === "node") {
                const cipher = crypto_1.default.createCipheriv("aes-256-gcm", keyBuffer, ivBuffer);
                const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
                const authTag = cipher.getAuthTag();
                const ciphertext = Buffer.concat([encrypted, authTag]);
                return Buffer.concat([ivBuffer, ciphertext]);
            }
            else if (constants_1.environment === "browser") {
                const encrypted = await globalThis.crypto.subtle.encrypt({
                    name: "AES-GCM",
                    iv: ivBuffer
                }, await (0, utils_1.importRawKey)({
                    key: keyBuffer,
                    algorithm: "AES-GCM",
                    mode: ["encrypt"],
                    keyCache: false
                }), data);
                return Buffer.concat([ivBuffer, new Uint8Array(encrypted)]);
            }
            else {
                throw new Error(`crypto.decrypt.data not implemented for ${constants_1.environment} environment`);
            }
        }
        else {
            throw new Error(`crypto.encrypt.data invalid version ${version}`);
        }
    }
    async dataStream({ inputFile, key, outputFile, version = constants_1.FILE_ENCRYPTION_VERSION }) {
        var _a;
        if (key.length === 0) {
            throw new Error("Invalid key.");
        }
        if (constants_1.environment !== "node") {
            throw new Error(`crypto.encrypt.dataStream not implemented for ${constants_1.environment} environment`);
        }
        const input = (0, utils_2.normalizePath)(inputFile);
        const output = (0, utils_2.normalizePath)(outputFile ? outputFile : path_1.default.join((_a = this.sdk.config.tmpPath) !== null && _a !== void 0 ? _a : os_1.default.tmpdir(), await (0, utils_2.uuidv4)()));
        if (!(await fs_extra_1.default.exists(input))) {
            throw new Error("Input file does not exist.");
        }
        await fs_extra_1.default.rm(output, {
            force: true,
            maxRetries: 60 * 10,
            recursive: true,
            retryDelay: 100
        });
        // If the key provided is not a 64 char hex encoded key, we cannot use it with v3. Downgrade to v2.
        if (version === 3 && (key.length !== 64 || !(0, utils_2.isValidHexString)(key))) {
            version = 2;
        }
        if (version === 2 && key.length !== 32) {
            throw new Error("v2 data encryption requires 32 char ascii key.");
        }
        if (version === 3 && key.length !== 64) {
            throw new Error("v3 file encryption requires 64 char hex key.");
        }
        const keyBuffer = version === 2 ? Buffer.from(key, "utf-8") : Buffer.from(key, "hex");
        const ivBuffer = version === 2 ? Buffer.from(await (0, utils_1.generateRandomString)(12), "utf-8") : await (0, utils_1.generateRandomBytes)(12);
        const cipher = crypto_1.default.createCipheriv("aes-256-gcm", keyBuffer, ivBuffer);
        const readStream = fs_extra_1.default.createReadStream((0, utils_2.normalizePath)(input), {
            highWaterMark: constants_1.BUFFER_SIZE
        });
        const writeStream = fs_extra_1.default.createWriteStream((0, utils_2.normalizePath)(output));
        await new Promise((resolve, reject) => {
            writeStream.write(ivBuffer, err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
        await pipelineAsync(readStream, cipher, writeStream);
        const authTag = cipher.getAuthTag();
        await fs_extra_1.default.appendFile(output, authTag);
        return output;
    }
}
exports.Encrypt = Encrypt;
exports.default = Encrypt;
//# sourceMappingURL=encrypt.js.map