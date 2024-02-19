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
/**
 * Chunk large Promise.all executions.
 * @date 2/14/2024 - 11:59:34 PM
 *
 * @export
 * @async
 * @template T
 * @param {Promise<T>[]} promises
 * @param {number} [chunkSize=10000]
 * @returns {Promise<T[]>}
 */
export declare function promiseAllChunked<T>(promises: Promise<T>[], chunkSize?: number): Promise<T[]>;
/**
 * Generate a random number. NOT CRYPTOGRAPHICALLY SAFE.
 * @date 2/17/2024 - 1:08:06 AM
 *
 * @export
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export declare function getRandomArbitrary(min: number, max: number): number;
/**
 * Clear the temporary directory.
 * @date 2/17/2024 - 1:15:42 AM
 *
 * @export
 * @async
 * @param {{ tmpDir?: string }} param0
 * @param {string} param0.tmpDir
 * @returns {Promise<void>}
 */
export declare function clearTempDirectory({ tmpDir }: {
    tmpDir?: string;
}): Promise<void>;
/**
 * Parse URL parameters.
 * @date 2/17/2024 - 4:57:54 AM
 *
 * @export
 * @param {{url: string}} param0
 * @param {string} param0.url
 * @returns {Record<string, string>}
 */
export declare function parseURLParams({ url }: {
    url: string;
}): Record<string, string>;
/**
 * Extract every possible directory path from a path.
 * @date 2/19/2024 - 6:02:06 AM
 *
 * @export
 * @param {string} path
 * @returns {string[]}
 */
export declare function getEveryPossibleDirectoryPath(path: string): string[];
export declare const utils: {
    sleep: typeof sleep;
    convertTimestampToMs: typeof convertTimestampToMs;
    normalizePath: typeof normalizePath;
    uuidv4: typeof uuidv4;
    Uint8ArrayConcat: typeof Uint8ArrayConcat;
    promiseAllChunked: typeof promiseAllChunked;
    getRandomArbitrary: typeof getRandomArbitrary;
    clearTempDirectory: typeof clearTempDirectory;
    parseURLParams: typeof parseURLParams;
    getEveryPossibleDirectoryPath: typeof getEveryPossibleDirectoryPath;
};
export default utils;
