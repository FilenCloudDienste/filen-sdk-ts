/// <reference types="node" />
/// <reference types="node" />
import { Transform } from "stream";
/**
 * Base64DecodeStream
 * @date 2/7/2024 - 12:46:12 AM
 *
 * @export
 * @class Base64DecodeStream
 * @typedef {Base64DecodeStream}
 * @extends {Transform}
 */
export declare class Base64DecodeStream extends Transform {
    /**
     * Creates an instance of Base64DecodeStream.
     * @date 2/7/2024 - 12:48:10 AM
     *
     * @constructor
     * @public
     */
    constructor();
    /**
     * Custom transform function, decodes each chunk from base64 to a buffer.
     * @date 2/7/2024 - 12:48:02 AM
     *
     * @public
     * @param {Buffer} chunk
     * @param {BufferEncoding} encoding
     * @param {(error?: Error | null, data?: Buffer) => void} callback
     */
    _transform(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null, data?: Buffer) => void): void;
}
/**
 * Decodes a base64 input file to an output file using streams.
 * @date 2/7/2024 - 12:47:06 AM
 *
 * @export
 * @async
 * @param {{ input: string; output: string }} param0
 * @param {string} param0.input
 * @param {string} param0.output
 * @returns {Promise<string>}
 */
export declare function streamDecodeBase64({ inputFile, outputFile }: {
    inputFile: string;
    outputFile: string;
}): Promise<string>;
