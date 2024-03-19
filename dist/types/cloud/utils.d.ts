/// <reference types="node" />
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
export declare function readLocalFileChunk({ path, offset, length }: {
    path: string;
    offset: number;
    length: number;
}): Promise<Buffer>;
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
export declare function readWebFileChunk({ file, index, length }: {
    file: File;
    index: number;
    length: number;
}): Promise<Buffer>;
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
export declare function calculateChunkIndices({ start, end, chunks }: {
    start: number;
    end: number;
    chunks: number;
}): [number, number];
export declare const utils: {
    readLocalFileChunk: typeof readLocalFileChunk;
    readWebFileChunk: typeof readWebFileChunk;
    calculateChunkIndices: typeof calculateChunkIndices;
};
export default utils;
