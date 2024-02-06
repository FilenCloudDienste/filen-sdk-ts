import type { AuthVersion } from "../types";
/**
 * Generate a cryptographically secure random string of given length.
 * @date 1/31/2024 - 4:01:20 PM
 *
 * @export
 * @param {{ length: number }} param0
 * @param {number} param0.length
 * @returns {string}
 */
export declare function generateRandomString({ length }: {
    length: number;
}): Promise<string>;
export type DeriveKeyFromPasswordBase = {
    password: string;
    salt: string;
    iterations: number;
    hash: "sha512";
    bitLength: 256 | 512;
};
export declare function deriveKeyFromPassword({ password, salt, iterations, hash, bitLength, returnHex }: DeriveKeyFromPasswordBase & {
    returnHex: false;
}): Promise<Uint8Array>;
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
 * Normalize hash names. E.g. WebCrypto uses "SHA-512" while Node.JS's Crypto Core lib uses "sha512".
 * @date 2/2/2024 - 6:59:42 PM
 *
 * @export
 * @param {{hash: string}} param0
 * @param {string} param0.hash
 * @returns {string}
 */
export declare function normalizeHash({ hash }: {
    hash: string;
}): string;
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
 * @returns {Promise<CryptoKey>}
 */
export declare function importPublicKey({ publicKey, mode }: {
    publicKey: string;
    mode?: KeyUsage[];
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
 * @returns {Promise<CryptoKey>}
 */
export declare function importPrivateKey({ privateKey, mode }: {
    privateKey: string;
    mode?: KeyUsage[];
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
};
export default utils;
