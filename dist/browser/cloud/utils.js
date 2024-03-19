import { normalizePath } from "../utils";
import fs from "fs-extra";
import { UPLOAD_CHUNK_SIZE } from "../constants";
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
export function readLocalFileChunk({ path, offset, length }) {
    return new Promise((resolve, reject) => {
        path = normalizePath(path);
        fs.open(path, "r", (err, fd) => {
            if (err) {
                reject(err);
                return;
            }
            const buffer = Buffer.alloc(length);
            fs.read(fd, buffer, 0, length, offset, (err, read) => {
                if (err) {
                    fs.close(fd, e => {
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
                    fs.close(fd, err => {
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
export function readWebFileChunk({ file, index, length }) {
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
export function calculateChunkIndices({ start, end, chunks }) {
    let firstChunkIndex = Math.floor(start / UPLOAD_CHUNK_SIZE);
    let lastChunkIndex = Math.floor(end / UPLOAD_CHUNK_SIZE) + 1;
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
export const utils = {
    readLocalFileChunk,
    readWebFileChunk,
    calculateChunkIndices
};
export default utils;
//# sourceMappingURL=utils.js.map