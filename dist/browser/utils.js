import pathModule from "path";
import { v4 as _uuidv4 } from "uuid";
import { environment } from "./constants";
import nodeCrypto from "crypto";
import os from "os";
import fs from "fs-extra";
import { xxHash32 } from "js-xxhash";
/**
 * "Sleep" for given milliseconds.
 * @date 1/31/2024 - 4:27:48 PM
 *
 * @export
 * @async
 * @param {number} ms
 * @returns {Promise<void>}
 */
export async function sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Convert a UNIX style timestamp (in seconds) to milliseconds
 * @date 1/31/2024 - 4:10:35 PM
 *
 * @export
 * @param {number} timestamp
 * @returns {number}
 */
export function convertTimestampToMs(timestamp) {
    const now = Date.now();
    if (Math.abs(now - timestamp) < Math.abs(now - timestamp * 1000)) {
        return timestamp;
    }
    return Math.floor(timestamp * 1000);
}
/**
 * Normalizes a path to UNIX/Windows standards.
 * @date 2/5/2024 - 9:13:01 PM
 *
 * @export
 * @param {string} path
 * @returns {string}
 */
export function normalizePath(path) {
    return pathModule.normalize(path.split("file://").join("").split("file:/").join("").split("file:").join(""));
}
/**
 * Generates a V4 UUID.
 * @date 2/6/2024 - 9:22:54 PM
 *
 * @export
 * @async
 * @returns {Promise<string>}
 */
export async function uuidv4() {
    if (environment === "node") {
        return nodeCrypto.randomUUID();
    }
    return _uuidv4();
}
/**
 * Concat two Uint8Arrays.
 * @date 2/7/2024 - 5:13:31 AM
 *
 * @export
 * @param {Uint8Array} a1
 * @param {Uint8Array} a2
 * @returns {Uint8Array}
 */
export function Uint8ArrayConcat(a1, a2) {
    const mergedArray = new Uint8Array(a1.length + a2.length);
    mergedArray.set(a1);
    mergedArray.set(a2, a1.length);
    return mergedArray;
}
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
export async function promiseAllChunked(promises, chunkSize = 10000) {
    const results = [];
    for (let i = 0; i < promises.length; i += chunkSize) {
        const chunkResults = await Promise.all(promises.slice(i, i + chunkSize));
        results.push(...chunkResults);
    }
    return results;
}
/**
 * Chunk large Promise.allSettled executions.
 * @date 3/5/2024 - 12:41:08 PM
 *
 * @export
 * @async
 * @template T
 * @param {Promise<T>[]} promises
 * @param {number} [chunkSize=10000]
 * @returns {Promise<T[]>}
 */
export async function promiseAllSettledChunked(promises, chunkSize = 10000) {
    const results = [];
    for (let i = 0; i < promises.length; i += chunkSize) {
        const chunkPromisesSettled = await Promise.allSettled(promises.slice(i, i + chunkSize));
        const chunkResults = chunkPromisesSettled.reduce((acc, current) => {
            if (current.status === "fulfilled") {
                acc.push(current.value);
            }
            else {
                // Handle rejected promises or do something with the error (current.reason)
            }
            return acc;
        }, []);
        results.push(...chunkResults);
    }
    return results;
}
/**
 * Generate a random number. NOT CRYPTOGRAPHICALLY SAFE.
 * @date 2/17/2024 - 1:08:06 AM
 *
 * @export
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
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
export async function clearTempDirectory({ tmpDir }) {
    if (environment !== "node") {
        return;
    }
    tmpDir = normalizePath(tmpDir ? tmpDir : pathModule.join(os.tmpdir(), "filen-sdk"));
    await fs.rm(tmpDir, {
        force: true,
        maxRetries: 60 * 10,
        recursive: true,
        retryDelay: 100
    });
    await fs.mkdir(tmpDir, {
        recursive: true
    });
}
/**
 * Parse URL parameters.
 * @date 2/17/2024 - 4:57:54 AM
 *
 * @export
 * @param {{url: string}} param0
 * @param {string} param0.url
 * @returns {Record<string, string>}
 */
export function parseURLParams({ url }) {
    const urlParams = new URLSearchParams(new URL(url).search);
    const params = {};
    urlParams.forEach((value, key) => {
        params[key] = value;
    });
    return params;
}
/**
 * Extract every possible directory path from a path.
 * @date 2/19/2024 - 6:02:06 AM
 *
 * @export
 * @param {string} path
 * @returns {string[]}
 */
export function getEveryPossibleDirectoryPath(path) {
    const ex = path.split("/");
    if (ex.length <= 1) {
        return [path];
    }
    const paths = [];
    for (let i = 0; i < ex.length; i++) {
        const toJoin = [];
        for (let x = 0; x < i + 1; x++) {
            toJoin.push(ex[x]);
        }
        paths.push(toJoin.join("/"));
    }
    if (paths.length <= 0) {
        return [path];
    }
    return paths;
}
/**
 * Convert a timestamp in ms to a simple date format
 * @date 2/19/2024 - 11:48:39 PM
 *
 * @export
 * @param {number} timestamp
 * @returns {string}
 */
export function simpleDate(timestamp) {
    try {
        return new Date(convertTimestampToMs(timestamp)).toString().split(" ").slice(0, 5).join(" ");
    }
    catch {
        return new Date().toString().split(" ").slice(0, 5).join(" ");
    }
}
/**
 * Replace a path with it's new parent path.
 *
 * @export
 * @param {string} path
 * @param {string} from
 * @param {string} to
 * @returns {string}
 */
export function replacePathStartWithFromAndTo(path, from, to) {
    if (path.endsWith("/")) {
        path = path.slice(0, path.length - 1);
    }
    if (from.endsWith("/")) {
        from = from.slice(0, from.length - 1);
    }
    if (to.endsWith("/")) {
        to = to.slice(0, to.length - 1);
    }
    if (!path.startsWith("/")) {
        path = `/${path}`;
    }
    if (!from.startsWith("/")) {
        from = `/${from}`;
    }
    if (!to.startsWith("/")) {
        to = `/${to}`;
    }
    return `${to}${path.slice(from.length)}`;
}
export function fastStringHash(input) {
    return input.substring(0, 8) + xxHash32(input, 0).toString(16) + input.substring(input.length - 8, input.length);
}
export function realFileSize({ chunksSize, metadataDecrypted }) {
    return metadataDecrypted.name.length > 0 ? metadataDecrypted.size : typeof chunksSize === "number" && chunksSize > 0 ? chunksSize : 0;
}
export async function nodeStreamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}
export function progressiveSplit(input) {
    const result = [];
    for (let i = 1; i <= input.length; i++) {
        result.push(input.substring(0, i));
    }
    return result;
}
export const WORD_SPLITTER_REGEX = /[\s\-_.;:,]+/g;
export const CLEAN_PREFIX_REGEX = /[^a-z0-9]/g;
export function nameSplitter(input) {
    if (!input || input.length === 0) {
        return [];
    }
    const result = new Set();
    const normalized = input.normalize("NFKC").toLowerCase().trim();
    const len = normalized.length;
    result.add(normalized);
    // Add non-accented version for better search
    const normalizedPlain = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalizedPlain !== normalized) {
        result.add(normalizedPlain);
    }
    if (len < 3) {
        return Array.from(result);
    }
    // Precompute frequently used values
    const cleanPrefix = normalized.replace(CLEAN_PREFIX_REGEX, "");
    const cleanLen = cleanPrefix.length;
    // Prefix handling
    if (cleanLen >= 3) {
        result.add(cleanPrefix.substring(0, 3));
        if (cleanLen >= 5) {
            result.add(cleanPrefix.substring(0, 5));
        }
        if (cleanLen >= 7) {
            result.add(cleanPrefix.substring(0, 7));
        }
        if (cleanLen >= 9) {
            result.add(cleanPrefix.substring(0, 9));
        }
    }
    // Number sequence extraction
    const numberMatches = [...cleanPrefix.matchAll(/\d{3,}/g)];
    for (const match of numberMatches) {
        result.add(match[0]);
    }
    // Sliding window
    const windowSizes = len > 15 ? [4, 5] : [4];
    for (const windowSize of windowSizes) {
        const stride = windowSize >>> 1; // Fast integer division by 2
        if (len >= windowSize) {
            const limit = len - windowSize;
            for (let i = 0; i <= limit; i += stride) {
                result.add(normalized.substring(i, i + windowSize)); // Fixed: added i +
            }
        }
    }
    // Word processing
    const words = normalized.split(WORD_SPLITTER_REGEX);
    const importantWords = [];
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (word && word.length >= 2) {
            importantWords.push(word);
            result.add(word);
            if (word.length > 8) {
                result.add(word.substring(0, 4));
                result.add(word.substring(0, 6));
            }
        }
    }
    // Word combinations
    const importantCount = importantWords.length;
    if (importantCount > 1 && importantCount <= 5) {
        for (let i = 0; i < importantCount - 1; i++) {
            const one = importantWords[i];
            const two = importantWords[i + 1];
            if (one && two) {
                result.add(one + two);
            }
        }
        if (importantCount >= 3) {
            const one = importantWords[0];
            const two = importantWords[importantCount - 1];
            if (one && two) {
                result.add(one + two);
            }
        }
    }
    // Suffix handling
    if (len >= 3) {
        result.add(normalized.substring(len - 3));
    }
    if (len >= 5) {
        result.add(normalized.substring(len - 5));
    }
    if (len >= 7) {
        result.add(normalized.substring(len - 7));
    }
    // Extension handling
    const dotIndex = normalized.lastIndexOf(".");
    if (dotIndex > 0 && dotIndex < len - 1) {
        const base = normalized.substring(0, dotIndex);
        const ext = normalized.substring(dotIndex + 1);
        result.add("." + ext);
        result.add(ext);
        if (dotIndex < 32) {
            result.add(base);
        }
    }
    return Array.from(result)
        .filter(token => token.length >= 2)
        .sort((a, b) => {
        const lengthDiff = a.length - b.length;
        if (lengthDiff !== 0) {
            return lengthDiff;
        }
        return a.localeCompare(b);
    })
        .slice(0, 256);
}
export function isValidHexString(str) {
    if (!/^[0-9a-fA-F]+$/.test(str)) {
        return false;
    }
    return str.length % 2 === 0;
}
export function isValidDirectoryName(name) {
    if (name.includes("/")) {
        return false;
    }
    return true;
}
export function isValidFileName(name) {
    if (name.includes("/")) {
        return false;
    }
    return true;
}
export function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}
export const utils = {
    sleep,
    convertTimestampToMs,
    normalizePath,
    uuidv4,
    Uint8ArrayConcat,
    promiseAllChunked,
    getRandomArbitrary,
    clearTempDirectory,
    parseURLParams,
    getEveryPossibleDirectoryPath,
    simpleDate,
    replacePathStartWithFromAndTo,
    fastStringHash,
    nodeStreamToBuffer,
    nameSplitter,
    isValidHexString,
    isValidDirectoryName,
    isValidFileName,
    progressiveSplit,
    chunkArray
};
export default utils;
//# sourceMappingURL=utils.js.map