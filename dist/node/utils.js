"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = exports.nodeStreamToBuffer = exports.realFileSize = exports.fastStringHash = exports.replacePathStartWithFromAndTo = exports.simpleDate = exports.getEveryPossibleDirectoryPath = exports.parseURLParams = exports.clearTempDirectory = exports.getRandomArbitrary = exports.promiseAllSettledChunked = exports.promiseAllChunked = exports.Uint8ArrayConcat = exports.uuidv4 = exports.normalizePath = exports.convertTimestampToMs = exports.sleep = void 0;
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const constants_1 = require("./constants");
const crypto_1 = __importDefault(require("crypto"));
const os_1 = __importDefault(require("os"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const js_xxhash_1 = require("js-xxhash");
/**
 * "Sleep" for given milliseconds.
 * @date 1/31/2024 - 4:27:48 PM
 *
 * @export
 * @async
 * @param {number} ms
 * @returns {Promise<void>}
 */
async function sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
/**
 * Convert a UNIX style timestamp (in seconds) to milliseconds
 * @date 1/31/2024 - 4:10:35 PM
 *
 * @export
 * @param {number} timestamp
 * @returns {number}
 */
function convertTimestampToMs(timestamp) {
    const now = Date.now();
    if (Math.abs(now - timestamp) < Math.abs(now - timestamp * 1000)) {
        return timestamp;
    }
    return Math.floor(timestamp * 1000);
}
exports.convertTimestampToMs = convertTimestampToMs;
/**
 * Normalizes a path to UNIX/Windows standards.
 * @date 2/5/2024 - 9:13:01 PM
 *
 * @export
 * @param {string} path
 * @returns {string}
 */
function normalizePath(path) {
    return path_1.default.normalize(path.split("file://").join("").split("file:/").join("").split("file:").join(""));
}
exports.normalizePath = normalizePath;
/**
 * Generates a V4 UUID.
 * @date 2/6/2024 - 9:22:54 PM
 *
 * @export
 * @async
 * @returns {Promise<string>}
 */
async function uuidv4() {
    if (constants_1.environment === "node") {
        return crypto_1.default.randomUUID();
    }
    return (0, uuid_1.v4)();
}
exports.uuidv4 = uuidv4;
/**
 * Concat two Uint8Arrays.
 * @date 2/7/2024 - 5:13:31 AM
 *
 * @export
 * @param {Uint8Array} a1
 * @param {Uint8Array} a2
 * @returns {Uint8Array}
 */
function Uint8ArrayConcat(a1, a2) {
    const mergedArray = new Uint8Array(a1.length + a2.length);
    mergedArray.set(a1);
    mergedArray.set(a2, a1.length);
    return mergedArray;
}
exports.Uint8ArrayConcat = Uint8ArrayConcat;
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
async function promiseAllChunked(promises, chunkSize = 10000) {
    const results = [];
    for (let i = 0; i < promises.length; i += chunkSize) {
        const chunkResults = await Promise.all(promises.slice(i, i + chunkSize));
        results.push(...chunkResults);
    }
    return results;
}
exports.promiseAllChunked = promiseAllChunked;
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
async function promiseAllSettledChunked(promises, chunkSize = 10000) {
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
exports.promiseAllSettledChunked = promiseAllSettledChunked;
/**
 * Generate a random number. NOT CRYPTOGRAPHICALLY SAFE.
 * @date 2/17/2024 - 1:08:06 AM
 *
 * @export
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
exports.getRandomArbitrary = getRandomArbitrary;
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
async function clearTempDirectory({ tmpDir }) {
    if (constants_1.environment !== "node") {
        return;
    }
    tmpDir = normalizePath(tmpDir ? tmpDir : path_1.default.join(os_1.default.tmpdir(), "filen-sdk"));
    await fs_extra_1.default.rm(tmpDir, {
        force: true,
        maxRetries: 60 * 10,
        recursive: true,
        retryDelay: 100
    });
    await fs_extra_1.default.mkdir(tmpDir, {
        recursive: true
    });
}
exports.clearTempDirectory = clearTempDirectory;
/**
 * Parse URL parameters.
 * @date 2/17/2024 - 4:57:54 AM
 *
 * @export
 * @param {{url: string}} param0
 * @param {string} param0.url
 * @returns {Record<string, string>}
 */
function parseURLParams({ url }) {
    const urlParams = new URLSearchParams(new URL(url).search);
    const params = {};
    urlParams.forEach((value, key) => {
        params[key] = value;
    });
    return params;
}
exports.parseURLParams = parseURLParams;
/**
 * Extract every possible directory path from a path.
 * @date 2/19/2024 - 6:02:06 AM
 *
 * @export
 * @param {string} path
 * @returns {string[]}
 */
function getEveryPossibleDirectoryPath(path) {
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
exports.getEveryPossibleDirectoryPath = getEveryPossibleDirectoryPath;
/**
 * Convert a timestamp in ms to a simple date format
 * @date 2/19/2024 - 11:48:39 PM
 *
 * @export
 * @param {number} timestamp
 * @returns {string}
 */
function simpleDate(timestamp) {
    try {
        return new Date(convertTimestampToMs(timestamp)).toString().split(" ").slice(0, 5).join(" ");
    }
    catch (e) {
        return new Date().toString().split(" ").slice(0, 5).join(" ");
    }
}
exports.simpleDate = simpleDate;
/**
 * Replace a path with it's new parent path.
 *
 * @export
 * @param {string} path
 * @param {string} from
 * @param {string} to
 * @returns {string}
 */
function replacePathStartWithFromAndTo(path, from, to) {
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
exports.replacePathStartWithFromAndTo = replacePathStartWithFromAndTo;
function fastStringHash(input) {
    return input.substring(0, 8) + (0, js_xxhash_1.xxHash32)(input, 0).toString(16) + input.substring(input.length - 8, input.length);
}
exports.fastStringHash = fastStringHash;
function realFileSize({ chunksSize, metadataDecrypted }) {
    return metadataDecrypted.name.length > 0 ? metadataDecrypted.size : typeof chunksSize === "number" && chunksSize > 0 ? chunksSize : 1;
}
exports.realFileSize = realFileSize;
async function nodeStreamToBuffer(stream) {
    var _a, e_1, _b, _c;
    const chunks = [];
    try {
        for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = await stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
            _c = stream_1_1.value;
            _d = false;
            const chunk = _c;
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = stream_1.return)) await _b.call(stream_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return Buffer.concat(chunks);
}
exports.nodeStreamToBuffer = nodeStreamToBuffer;
exports.utils = {
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
    nodeStreamToBuffer
};
exports.default = exports.utils;
//# sourceMappingURL=utils.js.map