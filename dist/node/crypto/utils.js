"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = exports.EVP_BytesToKey = exports.generateKeyPair = exports.bufferToHash = exports.importPBKDF2Key = exports.importRawKey = exports.importPrivateKey = exports.importPublicKey = exports.derKeyToPem = exports.generatePasswordAndMasterKeyBasedOnAuthVersion = exports.hashPassword = exports.normalizeHash = exports.hashFn = exports.deriveKeyFromPassword = exports.generateRandomString = void 0;
const constants_1 = require("../constants");
const crypto_1 = __importDefault(require("crypto"));
const crypto_api_v1_1 = __importDefault(require("crypto-api-v1"));
const js_crypto_key_utils_1 = __importDefault(require("js-crypto-key-utils"));
const cache_1 = __importDefault(require("../cache"));
const utils_1 = require("../utils");
const textEncoder = new TextEncoder();
/**
 * Generate a cryptographically secure random string of given length.
 * @date 1/31/2024 - 4:01:20 PM
 *
 * @export
 * @param {{ length: number }} param0
 * @param {number} param0.length
 * @returns {string}
 */
async function generateRandomString({ length }) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    if (constants_1.environment === "node") {
        const randomBytes = crypto_1.default.randomBytes(length + 2);
        const result = new Array(length);
        let cursor = 0;
        for (let i = 0; i < length; i++) {
            cursor += randomBytes[i];
            result[i] = chars[cursor % chars.length];
        }
        return result.join("");
    }
    else if (constants_1.environment === "browser") {
        const array = new Uint8Array(length);
        globalThis.crypto.getRandomValues(array);
        const randomNumbers = Array.from(array).map(x => x % chars.length);
        return randomNumbers.map(x => chars[x]).join("");
    }
    throw new Error(`crypto.utils.generateRandomString not implemented for ${constants_1.environment} environment`);
}
exports.generateRandomString = generateRandomString;
/**
 * Derive a key from given inputs using PBKDF2.
 * @date 2/1/2024 - 6:14:25 PM
 *
 * @export
 * @async
 * @param {DeriveKeyFromPasswordBase & {
 * 	returnHex: boolean
 * }} param0
 * @param {string} param0.password
 * @param {string} param0.salt
 * @param {number} param0.iterations
 * @param {"sha512"} param0.hash
 * @param {(256 | 512)} param0.bitLength
 * @param {boolean} param0.returnHex
 * @returns {Promise<string | Buffer>}
 */
async function deriveKeyFromPassword({ password, salt, iterations, hash, bitLength, returnHex }) {
    if (constants_1.environment === "node") {
        return await new Promise((resolve, reject) => {
            crypto_1.default.pbkdf2(password, salt, iterations, bitLength / 8, hash, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (returnHex) {
                    resolve(Buffer.from(result).toString("hex"));
                    return;
                }
                resolve(result);
            });
        });
    }
    else if (constants_1.environment === "browser") {
        const bits = await globalThis.crypto.subtle.deriveBits({
            name: "PBKDF2",
            salt: textEncoder.encode(salt),
            iterations: iterations,
            hash: {
                name: hash === "sha512" ? "SHA-512" : hash
            }
        }, await importPBKDF2Key({ key: password, mode: ["deriveBits"] }), bitLength);
        const key = returnHex ? Buffer.from(bits).toString("hex") : Buffer.from(bits);
        return key;
    }
    throw new Error(`crypto.utils.deriveKeyFromPassword not implemented for ${constants_1.environment} environment`);
}
exports.deriveKeyFromPassword = deriveKeyFromPassword;
/**
 * Hashes an input (mostly file/folder names).
 * @date 2/2/2024 - 6:59:32 PM
 *
 * @export
 * @async
 * @param {{input: string}} param0
 * @param {string} param0.input
 * @returns {Promise<string>}
 */
async function hashFn({ input }) {
    if (constants_1.environment === "node") {
        return crypto_1.default
            .createHash("sha1")
            .update(crypto_1.default.createHash("sha512").update(textEncoder.encode(input)).digest("hex"))
            .digest("hex");
    }
    else if (constants_1.environment === "browser") {
        return crypto_api_v1_1.default.hash("sha1", crypto_api_v1_1.default.hash("sha512", input));
    }
    throw new Error(`crypto.utils.hashFn not implemented for ${constants_1.environment} environment`);
}
exports.hashFn = hashFn;
/**
 * Normalize hash names. E.g. WebCrypto uses "SHA-512" while Node.JS's Crypto Core lib uses "sha512".
 * @date 2/2/2024 - 6:59:42 PM
 *
 * @export
 * @param {{hash: string}} param0
 * @param {string} param0.hash
 * @returns {string}
 */
function normalizeHash({ hash }) {
    const lowercased = hash.toLowerCase();
    if (lowercased === "sha-512") {
        return "sha512";
    }
    if (lowercased === "sha-256") {
        return "sha256";
    }
    if (lowercased === "sha-384") {
        return "sha384";
    }
    if (lowercased === "sha-1") {
        return "sha1";
    }
    if (lowercased === "md-2") {
        return "md2";
    }
    if (lowercased === "md-4") {
        return "md4";
    }
    if (lowercased === "md-5") {
        return "md5";
    }
    return hash;
}
exports.normalizeHash = normalizeHash;
/**
 * Old V1 authentication password hashing. DEPRECATED AND NOT IN USE, JUST HERE FOR BACKWARDS COMPATIBILITY.
 * @date 2/2/2024 - 6:59:54 PM
 *
 * @export
 * @async
 * @param {{password: string}} param0
 * @param {string} param0.password
 * @returns {Promise<string>}
 */
async function hashPassword({ password }) {
    if (constants_1.environment === "browser" || constants_1.environment === "node") {
        return (crypto_api_v1_1.default.hash("sha512", crypto_api_v1_1.default.hash("sha384", crypto_api_v1_1.default.hash("sha256", crypto_api_v1_1.default.hash("sha1", password)))) +
            crypto_api_v1_1.default.hash("sha512", crypto_api_v1_1.default.hash("md5", crypto_api_v1_1.default.hash("md4", crypto_api_v1_1.default.hash("md2", password)))));
    }
    throw new Error(`crypto.utils.hashPassword not implemented for ${constants_1.environment} environment`);
}
exports.hashPassword = hashPassword;
/**
 * Generates/derives the password and master key based on the auth version. Auth Version 1 is deprecated and no longer in use.
 * @date 2/2/2024 - 6:16:04 PM
 *
 * @export
 * @async
 * @param {{rawPassword: string, authVersion: AuthVersion, salt: string}} param0
 * @param {string} param0.rawPassword
 * @param {AuthVersion} param0.authVersion
 * @param {string} param0.salt
 * @returns {Promise<{ derivedMasterKeys: string; derivedPassword: string }>}
 */
async function generatePasswordAndMasterKeyBasedOnAuthVersion({ rawPassword, authVersion, salt }) {
    if (authVersion === 1) {
        // DEPRECATED AND NOT IN USE, JUST HERE FOR BACKWARDS COMPATIBILITY.
        const derivedPassword = await hashPassword({ password: rawPassword });
        const derivedMasterKeys = await hashFn({ input: rawPassword });
        return { derivedMasterKeys, derivedPassword };
    }
    else if (authVersion === 2) {
        const derivedKey = await deriveKeyFromPassword({
            password: rawPassword,
            salt,
            iterations: 200000,
            hash: "sha512",
            bitLength: 512,
            returnHex: true
        });
        let derivedPassword = derivedKey.substring(derivedKey.length / 2, derivedKey.length);
        const derivedMasterKeys = derivedKey.substring(0, derivedKey.length / 2);
        if (constants_1.environment === "node") {
            derivedPassword = crypto_1.default.createHash("sha512").update(textEncoder.encode(derivedPassword)).digest("hex");
        }
        else if (constants_1.environment === "browser") {
            derivedPassword = Buffer.from(await globalThis.crypto.subtle.digest("SHA-512", textEncoder.encode(derivedPassword))).toString("hex");
        }
        else {
            throw new Error(`crypto.utils.generatePasswordAndMasterKeysBasedOnAuthVersion not implemented for ${constants_1.environment} environment`);
        }
        return { derivedMasterKeys, derivedPassword };
    }
    else {
        throw new Error(`Invalid authVersion: ${authVersion}`);
    }
}
exports.generatePasswordAndMasterKeyBasedOnAuthVersion = generatePasswordAndMasterKeyBasedOnAuthVersion;
/**
 * Converts a public/private key in DER format to PEM.
 * @date 2/2/2024 - 7:00:12 PM
 *
 * @export
 * @async
 * @param {{key: string}} param0
 * @param {string} param0.key
 * @returns {Promise<string>}
 */
async function derKeyToPem({ key }) {
    const importedKey = new js_crypto_key_utils_1.default.Key("der", Buffer.from(key, "base64"));
    return (await importedKey.export("pem")).toString();
}
exports.derKeyToPem = derKeyToPem;
/**
 * Imports a base64 encoded SPKI public key to WebCrypto's format.
 * @date 2/2/2024 - 7:04:12 PM
 *
 * @export
 * @async
 * @param {{ publicKey: string; mode?: KeyUsage[] }} param0
 * @param {string} param0.publicKey
 * @param {{}} [param0.mode=["encrypt"]]
 * @param {boolean} [param0.keyCache=true]
 * @returns {Promise<CryptoKey>}
 */
async function importPublicKey({ publicKey, mode = ["encrypt"], keyCache = true }) {
    if (constants_1.environment !== "browser") {
        throw new Error(`crypto.utils.importPublicKey not implemented for ${constants_1.environment} environment`);
    }
    const cacheKey = (0, utils_1.fastStringHash)(`${publicKey}:${mode.join(":")}`);
    if (cache_1.default.importPublicKey.has(cacheKey)) {
        return cache_1.default.importPublicKey.get(cacheKey);
    }
    const importedPublicKey = await globalThis.crypto.subtle.importKey("spki", Buffer.from(publicKey, "base64"), {
        name: "RSA-OAEP",
        hash: "SHA-512"
    }, true, mode);
    if (keyCache) {
        cache_1.default.importPublicKey.set(cacheKey, importedPublicKey);
    }
    return importedPublicKey;
}
exports.importPublicKey = importPublicKey;
/**
 * Imports a base64 PCS8 private key to WebCrypto's format.
 * @date 2/3/2024 - 1:44:39 AM
 *
 * @export
 * @async
 * @param {{ privateKey: string; mode?: KeyUsage[] }} param0
 * @param {string} param0.privateKey
 * @param {{}} [param0.mode=["encrypt"]]
 * @param {boolean} [param0.keyCache=true]
 * @returns {Promise<CryptoKey>}
 */
async function importPrivateKey({ privateKey, mode = ["encrypt"], keyCache = true }) {
    if (constants_1.environment !== "browser") {
        throw new Error(`crypto.utils.importPrivateKey not implemented for ${constants_1.environment} environment`);
    }
    const cacheKey = (0, utils_1.fastStringHash)(`${privateKey}:${mode.join(":")}`);
    if (cache_1.default.importPrivateKey.has(cacheKey)) {
        return cache_1.default.importPrivateKey.get(cacheKey);
    }
    const importedPrivateKey = await globalThis.crypto.subtle.importKey("pkcs8", Buffer.from(privateKey, "base64"), {
        name: "RSA-OAEP",
        hash: "SHA-512"
    }, true, mode);
    if (keyCache) {
        cache_1.default.importPrivateKey.set(cacheKey, importedPrivateKey);
    }
    return importedPrivateKey;
}
exports.importPrivateKey = importPrivateKey;
/**
 * Imports a raw key to WebCrypto's fromat.
 * @date 3/6/2024 - 11:13:40 PM
 *
 * @export
 * @async
 * @param {{
 * 	key: Buffer
 * 	algorithm: "AES-GCM" | "AES-CBC"
 * 	mode?: KeyUsage[]
 * 	keyCache?: boolean
 * }} param0
 * @param {Buffer} param0.key
 * @param {("AES-GCM" | "AES-CBC")} param0.algorithm
 * @param {{}} [param0.mode=["encrypt"]]
 * @param {boolean} [param0.keyCache=true]
 * @returns {Promise<CryptoKey>}
 */
async function importRawKey({ key, algorithm, mode = ["encrypt"], keyCache = true }) {
    if (constants_1.environment !== "browser") {
        throw new Error(`crypto.utils.importRawKey not implemented for ${constants_1.environment} environment`);
    }
    const cacheKey = (0, utils_1.fastStringHash)(`${key}:${algorithm}:${mode.join(":")}`);
    if (cache_1.default.importRawKey.has(cacheKey)) {
        return cache_1.default.importRawKey.get(cacheKey);
    }
    const importedRawKey = await globalThis.crypto.subtle.importKey("raw", key, algorithm, false, mode);
    if (keyCache) {
        cache_1.default.importRawKey.set(cacheKey, importedRawKey);
    }
    return importedRawKey;
}
exports.importRawKey = importRawKey;
/**
 * Imports a PBKDF2 key into WebCrypto's format.
 * @date 2/6/2024 - 8:56:57 PM
 *
 * @export
 * @async
 * @param {{ key: string; mode?: KeyUsage[], keyCache?: boolean }} param0
 * @param {string} param0.key
 * @param {{}} [param0.mode=["encrypt"]]
 * @param {boolean} [param0.keyCache=true]
 * @returns {Promise<CryptoKey>}
 */
async function importPBKDF2Key({ key, mode = ["encrypt"], keyCache = true }) {
    if (constants_1.environment !== "browser") {
        throw new Error(`crypto.utils.importPBKDF2Key not implemented for ${constants_1.environment} environment`);
    }
    const cacheKey = (0, utils_1.fastStringHash)(`${key}:${mode.join(":")}`);
    if (cache_1.default.importPBKDF2Key.has(cacheKey)) {
        return cache_1.default.importPBKDF2Key.get(cacheKey);
    }
    const importedPBKF2Key = await globalThis.crypto.subtle.importKey("raw", textEncoder.encode(key), {
        name: "PBKDF2"
    }, false, mode);
    if (keyCache) {
        cache_1.default.importPBKDF2Key.set(cacheKey, importedPBKF2Key);
    }
    return importedPBKF2Key;
}
exports.importPBKDF2Key = importPBKDF2Key;
/**
 * Generates the hash hex digest of a Buffer/Uint8Array.
 * @date 2/3/2024 - 2:03:24 AM
 *
 * @export
 * @async
 * @param {({buffer: Uint8Array, algorithm: "sha256" | "sha512" | "md5"})} param0
 * @param {Uint8Array} param0.buffer
 * @param {("sha256" | "sha512" | "md5")} param0.algorithm
 * @returns {Promise<string>}
 */
async function bufferToHash({ buffer, algorithm }) {
    if (constants_1.environment === "node") {
        return crypto_1.default.createHash(algorithm).update(buffer).digest("hex");
    }
    else if (constants_1.environment === "browser") {
        const webcryptoAlgorithm = algorithm === "sha512" ? "SHA-512" : algorithm === "sha256" ? "SHA-256" : "MD-5";
        const digest = await globalThis.crypto.subtle.digest(webcryptoAlgorithm, buffer);
        return Buffer.from(digest).toString("hex");
    }
    throw new Error(`crypto.utils.bufferToHash not implemented for ${constants_1.environment} environment`);
}
exports.bufferToHash = bufferToHash;
/**
 * Generate an asymmetric public/private keypair.
 * @date 2/6/2024 - 3:24:43 AM
 *
 * @export
 * @async
 * @returns {Promise<{ publicKey: string; privateKey: string }>}
 */
async function generateKeyPair() {
    if (constants_1.environment === "node") {
        return await new Promise((resolve, reject) => {
            crypto_1.default.generateKeyPair("rsa", {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: "spki",
                    format: "der"
                },
                privateKeyEncoding: {
                    type: "pkcs8",
                    format: "der"
                },
                publicExponent: 0x10001
            }, (err, publicKey, privateKey) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({
                    publicKey: publicKey.toString("base64"),
                    privateKey: privateKey.toString("base64")
                });
            });
        });
    }
    else if (constants_1.environment === "browser") {
        const keyPair = await globalThis.crypto.subtle.generateKey({
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-512"
        }, true, ["encrypt", "decrypt"]);
        const publicKey = await globalThis.crypto.subtle.exportKey("spki", keyPair.publicKey);
        const privateKey = await globalThis.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
        return {
            publicKey: Buffer.from(publicKey).toString("base64"),
            privateKey: Buffer.from(privateKey).toString("base64")
        };
    }
    throw new Error(`crypto.utils.generateKeyPair not implemented for ${constants_1.environment} environment`);
}
exports.generateKeyPair = generateKeyPair;
/**
 * JS implementation of OpenSSL's EVP_BytesToKey. Depcrecated. NOT IN USE. Just here for backwards compatibility of another function.
 * @date 2/7/2024 - 1:00:21 AM
 *
 * @export
 * @param {{
 * 	password: Buffer
 * 	salt: Buffer
 * 	keyBits: number
 * 	ivLength: number
 * }} param0
 * @param {Buffer} param0.password
 * @param {Buffer} param0.salt
 * @param {number} param0.keyBits
 * @param {number} param0.ivLength
 * @returns {{ key: Buffer; iv: Buffer }}
 */
function EVP_BytesToKey({ password, salt, keyBits, ivLength }) {
    let keyLen = keyBits / 8;
    const key = Buffer.alloc(keyLen);
    const iv = Buffer.alloc(ivLength || 0);
    let tmp = Buffer.alloc(0);
    while (keyLen > 0 || ivLength > 0) {
        const hash = crypto_1.default.createHash("md5");
        hash.update(tmp);
        hash.update(password);
        if (salt) {
            hash.update(salt);
        }
        tmp = hash.digest();
        let used = 0;
        if (keyLen > 0) {
            const keyStart = key.length - keyLen;
            used = Math.min(keyLen, tmp.length);
            tmp.copy(key, keyStart, 0, used);
            keyLen -= used;
        }
        if (used < tmp.length && ivLength > 0) {
            const ivStart = iv.length - ivLength;
            const length = Math.min(ivLength, tmp.length - used);
            tmp.copy(iv, ivStart, used, used + length);
            ivLength -= length;
        }
    }
    tmp.fill(0);
    return {
        key,
        iv
    };
}
exports.EVP_BytesToKey = EVP_BytesToKey;
exports.utils = {
    generateRandomString,
    deriveKeyFromPassword,
    hashFn,
    generatePasswordAndMasterKeyBasedOnAuthVersion,
    hashPassword,
    derKeyToPem,
    importPublicKey,
    importPrivateKey,
    bufferToHash,
    generateKeyPair,
    importRawKey,
    importPBKDF2Key
};
exports.default = exports.utils;
//# sourceMappingURL=utils.js.map