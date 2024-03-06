"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamEncodeBase64 = exports.streamDecodeBase64 = exports.Base64EncodeStream = exports.Base64DecodeStream = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const stream_1 = require("stream");
const util_1 = require("util");
const utils_1 = require("../utils");
const constants_1 = require("../constants");
const pipelineAsync = (0, util_1.promisify)(stream_1.pipeline);
/**
 * Base64DecodeStream
 * @date 2/7/2024 - 12:46:12 AM
 *
 * @export
 * @class Base64DecodeStream
 * @typedef {Base64DecodeStream}
 * @extends {Transform}
 */
class Base64DecodeStream extends stream_1.Transform {
    /**
     * Creates an instance of Base64DecodeStream.
     * @date 2/7/2024 - 12:48:10 AM
     *
     * @constructor
     * @public
     */
    constructor() {
        super();
    }
    /**
     * Custom transform function, decodes each chunk from base64 to a buffer.
     * @date 2/7/2024 - 12:48:02 AM
     *
     * @public
     * @param {Buffer} chunk
     * @param {BufferEncoding} encoding
     * @param {(error?: Error | null, data?: Buffer) => void} callback
     */
    _transform(chunk, encoding, callback) {
        try {
            this.push(Buffer.from(chunk.toString("utf-8"), "base64"));
            callback();
        }
        catch (e) {
            callback(e);
        }
    }
}
exports.Base64DecodeStream = Base64DecodeStream;
/**
 * Base64EncodeStream
 * @date 2/10/2024 - 2:55:35 PM
 *
 * @export
 * @class Base64EncodeStream
 * @typedef {Base64EncodeStream}
 * @extends {Transform}
 */
class Base64EncodeStream extends stream_1.Transform {
    constructor() {
        super();
    }
    /**
     * Custom transform function, encodes each chunk from a buffer to base64.
     * @date 2/7/2024 - 12:48:02 AM
     *
     * @public
     * @param {Buffer} chunk
     * @param {BufferEncoding} encoding
     * @param {(error?: Error | null, data?: Buffer) => void} callback
     */
    _transform(chunk, encoding, callback) {
        try {
            this.push(chunk.toString("base64"));
            callback();
        }
        catch (e) {
            callback(e);
        }
    }
}
exports.Base64EncodeStream = Base64EncodeStream;
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
async function streamDecodeBase64({ inputFile, outputFile }) {
    const input = (0, utils_1.normalizePath)(inputFile);
    const output = (0, utils_1.normalizePath)(outputFile);
    if (!(await fs_extra_1.default.exists(input))) {
        throw new Error("Input file does not exist.");
    }
    await fs_extra_1.default.rm(output, {
        force: true,
        maxRetries: 60 * 10,
        recursive: true,
        retryDelay: 100
    });
    const readStream = fs_extra_1.default.createReadStream(input, {
        highWaterMark: constants_1.BASE64_BUFFER_SIZE
    });
    const writeStream = fs_extra_1.default.createWriteStream(output);
    await pipelineAsync(readStream, new Base64DecodeStream(), writeStream);
    return output;
}
exports.streamDecodeBase64 = streamDecodeBase64;
/**
 * Encodes a input file to an output file in base64 using streams.
 * @date 2/10/2024 - 2:56:34 PM
 *
 * @export
 * @async
 * @param {{ inputFile: string; outputFile: string }} param0
 * @param {string} param0.inputFile
 * @param {string} param0.outputFile
 * @returns {Promise<string>}
 */
async function streamEncodeBase64({ inputFile, outputFile }) {
    const input = (0, utils_1.normalizePath)(inputFile);
    const output = (0, utils_1.normalizePath)(outputFile);
    if (!(await fs_extra_1.default.exists(input))) {
        throw new Error("Input file does not exist.");
    }
    await fs_extra_1.default.rm(output, {
        force: true,
        maxRetries: 60 * 10,
        recursive: true,
        retryDelay: 100
    });
    const readStream = fs_extra_1.default.createReadStream(input, {
        highWaterMark: constants_1.BASE64_BUFFER_SIZE
    });
    const writeStream = fs_extra_1.default.createWriteStream(output);
    await pipelineAsync(readStream, new Base64EncodeStream(), writeStream);
    return output;
}
exports.streamEncodeBase64 = streamEncodeBase64;
//# sourceMappingURL=base64.js.map