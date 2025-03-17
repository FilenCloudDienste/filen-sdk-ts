import { type AuthVersion } from "../types";
export declare const base64Charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
export declare const asciiCharset: string;
export declare function generateRandomString(length?: number): Promise<string>;
export declare function generateRandomBytes(length?: number): Promise<Buffer>;
export declare function generateRandomURLSafeString(length?: number): Promise<string>;
export declare function generateRandomHexString(length?: number): Promise<string>;
export declare function generateEncryptionKey(use: "file" | "metadata"): Promise<string>;
export declare function hashFileName({ name, authVersion, hmacKey }: {
    name: string;
    authVersion: AuthVersion;
    hmacKey?: Buffer;
}): Promise<string>;
export declare function hashSearchIndex({ name, hmacKey }: {
    name: string;
    hmacKey: Buffer;
}): Promise<string>;
export declare function generateSearchIndexHashes({ input, hmacKey }: {
    input: string;
    hmacKey: Buffer;
}): Promise<string[]>;
export declare function generatePrivateKeyHMAC(privateKey: string): Promise<Buffer>;
export type DeriveKeyFromPasswordBase = {
    password: string;
    salt: string;
    iterations: number;
    hash: "sha512";
    bitLength: 256 | 512;
};
export declare function deriveKeyFromPassword({ password, salt, iterations, hash, bitLength, returnHex }: DeriveKeyFromPasswordBase & {
    returnHex: false;
}): Promise<Buffer>;
export declare function deriveKeyFromPassword({ password, salt, iterations, hash, bitLength, returnHex }: DeriveKeyFromPasswordBase & {
    returnHex: true;
}): Promise<string>;
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
export declare function hashFn({ input }: {
    input: string;
}): Promise<string>;
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
export declare function hashPassword({ password }: {
    password: string;
}): Promise<string>;
/**
 * Generates/derives the password and master key based on the auth version. Auth Version 1 is deprecated and no longer in use. V2 uses PBKDF2, while V3 uses Argon2id.
 *
 * @export
 * @async
 * @param {{rawPassword: string, authVersion: AuthVersion, salt: string}} param0
 * @param {string} param0.rawPassword
 * @param {AuthVersion} param0.authVersion
 * @param {string} param0.salt
 * @returns {Promise<{ derivedMasterKeys: string; derivedPassword: string }>}
 */
export declare function generatePasswordAndMasterKeyBasedOnAuthVersion({ rawPassword, authVersion, salt }: {
    rawPassword: string;
    authVersion: AuthVersion;
    salt: string;
}): Promise<{
    derivedMasterKeys: string;
    derivedPassword: string;
}>;
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
export declare function derKeyToPem({ key }: {
    key: string;
}): Promise<string>;
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
export declare function importPublicKey({ publicKey, mode, keyCache }: {
    publicKey: string;
    mode?: KeyUsage[];
    keyCache?: boolean;
}): Promise<CryptoKey>;
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
export declare function importPrivateKey({ privateKey, mode, keyCache }: {
    privateKey: string;
    mode?: KeyUsage[];
    keyCache?: boolean;
}): Promise<CryptoKey>;
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
export declare function importRawKey({ key, algorithm, mode, keyCache }: {
    key: Buffer;
    algorithm: "AES-GCM" | "AES-CBC";
    mode?: KeyUsage[];
    keyCache?: boolean;
}): Promise<CryptoKey>;
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
export declare function importPBKDF2Key({ key, mode, keyCache }: {
    key: string;
    mode?: KeyUsage[];
    keyCache?: boolean;
}): Promise<CryptoKey>;
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
export declare function bufferToHash({ buffer, algorithm }: {
    buffer: Uint8Array;
    algorithm: "sha256" | "sha512" | "md5";
}): Promise<string>;
/**
 * Generate an asymmetric public/private keypair.
 * @date 2/6/2024 - 3:24:43 AM
 *
 * @export
 * @async
 * @returns {Promise<{ publicKey: string; privateKey: string }>}
 */
export declare function generateKeyPair(): Promise<{
    publicKey: string;
    privateKey: string;
}>;
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
export declare function EVP_BytesToKey({ password, salt, keyBits, ivLength }: {
    password: Buffer;
    salt: Buffer;
    keyBits: number;
    ivLength: number;
}): {
    key: Buffer;
    iv: Buffer;
};
export declare const utils: {
    generateRandomString: typeof generateRandomString;
    deriveKeyFromPassword: typeof deriveKeyFromPassword;
    hashFn: typeof hashFn;
    generatePasswordAndMasterKeyBasedOnAuthVersion: typeof generatePasswordAndMasterKeyBasedOnAuthVersion;
    hashPassword: typeof hashPassword;
    derKeyToPem: typeof derKeyToPem;
    importPublicKey: typeof importPublicKey;
    importPrivateKey: typeof importPrivateKey;
    bufferToHash: typeof bufferToHash;
    generateKeyPair: typeof generateKeyPair;
    importRawKey: typeof importRawKey;
    importPBKDF2Key: typeof importPBKDF2Key;
    generateRandomBytes: typeof generateRandomBytes;
    generateRandomURLSafeString: typeof generateRandomURLSafeString;
    generateRandomHexString: typeof generateRandomHexString;
    hashFileName: typeof hashFileName;
    hashSearchIndex: typeof hashSearchIndex;
    generateSearchIndexHashes: typeof generateSearchIndexHashes;
    generatePrivateKeyHMAC: typeof generatePrivateKeyHMAC;
    generateEncryptionKey: typeof generateEncryptionKey;
};
export default utils;
