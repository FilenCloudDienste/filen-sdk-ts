"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = exports.calculateChunkIndices = exports.readWebFileChunk = exports.readLocalFileChunk = void 0;
const utils_1 = require("../utils");
const fs_extra_1 = __importDefault(require("fs-extra"));
const constants_1 = require("../constants");
/**
 * Reads a chunk from a local file.
 * @date 2/16/2024 - 5:45:19 AM
 *
 * @export
 * @param {{ path: string; offset: number; length: number }} param0
 * @param {string} param0.path
 * @param {number} param0.offset
 * @param {number} param0.length
 * @returns {Promise<Buffer>}
 */
function readLocalFileChunk({ path, offset, length }) {
    return new Promise((resolve, reject) => {
        path = (0, utils_1.normalizePath)(path);
        fs_extra_1.default.open(path, "r", (err, fd) => {
            if (err) {
                reject(err);
                return;
            }
            const buffer = Buffer.alloc(length);
            fs_extra_1.default.read(fd, buffer, 0, length, offset, (err, read) => {
                if (err) {
                    fs_extra_1.default.close(fd, e => {
                        if (err) {
                            reject(e);
                            return;
                        }
                        reject(err);
                    });
                }
                else {
                    let data;
                    if (read < length) {
                        data = buffer.subarray(0, read);
                    }
                    else {
                        data = buffer;
                    }
                    fs_extra_1.default.close(fd, err => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(data);
                    });
                }
            });
        });
    });
}
exports.readLocalFileChunk = readLocalFileChunk;
/**
 * Reads a chunk from a web-based file, such as from an <input /> field.
 * @date 2/16/2024 - 5:45:27 AM
 *
 * @export
 * @param {{ file: File; index: number; length: number }} param0
 * @param {File} param0.file
 * @param {number} param0.index
 * @param {number} param0.length
 * @returns {Promise<Buffer>}
 */
function readWebFileChunk({ file, index, length }) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
            if (typeof fileReader.result === "string" || fileReader.result === null) {
                resolve(Buffer.from([]));
                return;
            }
            resolve(Buffer.from(fileReader.result));
        };
        fileReader.onerror = reject;
        const offset = length * index;
        fileReader.readAsArrayBuffer(file.slice(offset, offset + length));
    });
}
exports.readWebFileChunk = readWebFileChunk;
/**
 * Calculate the first and the last chunk of a file to fetch between startBytes and endBytes.
 * @date 3/18/2024 - 1:19:27 AM
 *
 * @export
 * @param {{start: number, end: number, chunks: number}} param0
 * @param {number} param0.start
 * @param {number} param0.end
 * @param {number} param0.chunks
 * @returns {[number, number]}
 */
function calculateChunkIndices({ start, end, chunks }) {
    let firstChunkIndex = Math.floor(start / constants_1.UPLOAD_CHUNK_SIZE);
    let lastChunkIndex = Math.floor(end / constants_1.UPLOAD_CHUNK_SIZE) + 1;
    if (firstChunkIndex <= 0) {
        firstChunkIndex = 0;
    }
    if (firstChunkIndex >= chunks) {
        firstChunkIndex = chunks;
    }
    if (firstChunkIndex >= lastChunkIndex) {
        firstChunkIndex = lastChunkIndex;
    }
    if (lastChunkIndex >= chunks) {
        lastChunkIndex = chunks;
    }
    return [firstChunkIndex, lastChunkIndex];
}
exports.calculateChunkIndices = calculateChunkIndices;
exports.utils = {
    readLocalFileChunk,
    readWebFileChunk,
    calculateChunkIndices
};
exports.default = exports.utils;
//# sourceMappingURL=utils.js.map