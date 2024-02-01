/// <reference types="node" />
/**
 * Generate a cryptographically secure random string of given length
 * @date 1/31/2024 - 4:01:20 PM
 *
 * @export
 * @param {{ length: number }} param0
 * @param {number} param0.length
 * @returns {string}
 */
export declare function generateRandomString({ length }: {
    length: number;
}): string;
/**
 * Convert a buffer to base64
 * @date 1/31/2024 - 4:01:49 PM
 *
 * @export
 * @param {({ buffer: ArrayBuffer | Uint8Array | Buffer })} param0
 * @param {*} param0.buffer
 * @returns {string}
 */
export declare function bufferToBase64({ buffer }: {
    buffer: ArrayBuffer | Uint8Array | Buffer;
}): string;
/**
 * Convert a buffer to a hex string
 * @date 1/31/2024 - 4:03:03 PM
 *
 * @export
 * @param {({ buffer: ArrayBuffer | Uint8Array | Buffer })} param0
 * @param {*} param0.buffer
 * @returns {string}
 */
export declare function bufferToHex({ buffer }: {
    buffer: ArrayBuffer | Uint8Array | Buffer;
}): string;
/**
 * Derive a key from given inputs using PBKDF2
 * @date 1/31/2024 - 4:03:29 PM
 *
 * @export
 * @async
 * @param {{
 * 	password: string
 * 	salt: string
 * 	iterations: number
 * 	hash: "sha512"
 * 	bitLength: 256 | 512
 * 	returnHex: boolean
 * }} param0
 * @param {string} param0.password
 * @param {string} param0.salt
 * @param {number} param0.iterations
 * @param {"sha512"} param0.hash
 * @param {(256 | 512)} param0.bitLength
 * @param {boolean} param0.returnHex
 * @returns {Promise<string | Uint8Array>}
 */
export declare function deriveKeyFromPassword({ password, salt, iterations, hash, bitLength, returnHex }: {
    password: string;
    salt: string;
    iterations: number;
    hash: "sha512";
    bitLength: 256 | 512;
    returnHex: boolean;
}): Promise<string | Uint8Array>;
/**
 * Convert base64 to a buffer
 * @date 1/31/2024 - 4:04:21 PM
 *
 * @export
 * @param {string} base64
 * @returns {Uint8Array}
 */
export declare function base64ToBuffer(base64: string): Uint8Array;
export declare const utils: {
    generateRandomString: typeof generateRandomString;
    bufferToBase64: typeof bufferToBase64;
    bufferToHex: typeof bufferToHex;
    deriveKeyFromPassword: typeof deriveKeyFromPassword;
    base64ToBuffer: typeof base64ToBuffer;
};
export default utils;
