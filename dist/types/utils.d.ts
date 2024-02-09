/**
 * "Sleep" for given milliseconds.
 * @date 1/31/2024 - 4:27:48 PM
 *
 * @export
 * @async
 * @param {number} ms
 * @returns {Promise<void>}
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Convert a UNIX style timestamp (in seconds) to milliseconds
 * @date 1/31/2024 - 4:10:35 PM
 *
 * @export
 * @param {number} timestamp
 * @returns {number}
 */
export declare function convertTimestampToMs(timestamp: number): number;
/**
 * Normalizes a path to UNIX/Windows standards.
 * @date 2/5/2024 - 9:13:01 PM
 *
 * @export
 * @param {string} path
 * @returns {string}
 */
export declare function normalizePath(path: string): string;
/**
 * Generates a V4 UUID.
 * @date 2/6/2024 - 9:22:54 PM
 *
 * @export
 * @async
 * @returns {Promise<string>}
 */
export declare function uuidv4(): Promise<string>;
/**
 * Concat two Uint8Arrays.
 * @date 2/7/2024 - 5:13:31 AM
 *
 * @export
 * @param {Uint8Array} a1
 * @param {Uint8Array} a2
 * @returns {Uint8Array}
 */
export declare function Uint8ArrayConcat(a1: Uint8Array, a2: Uint8Array): Uint8Array;
export declare const utils: {
    sleep: typeof sleep;
    convertTimestampToMs: typeof convertTimestampToMs;
    normalizePath: typeof normalizePath;
    uuidv4: typeof uuidv4;
    Uint8ArrayConcat: typeof Uint8ArrayConcat;
};
export default utils;
