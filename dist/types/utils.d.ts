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
export declare const utils: {
    sleep: typeof sleep;
    convertTimestampToMs: typeof convertTimestampToMs;
    normalizePath: typeof normalizePath;
};
export default utils;
