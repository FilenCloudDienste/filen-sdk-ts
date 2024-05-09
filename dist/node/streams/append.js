"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.append = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const stream_1 = require("stream");
const util_1 = require("util");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const pipelineAsync = (0, util_1.promisify)(stream_1.pipeline);
/**
 * Append one file to another using streams.
 * @date 2/7/2024 - 5:13:02 AM
 *
 * @export
 * @async
 * @param {{ inputFile: string; baseFile: string }} param0
 * @param {string} param0.inputFile
 * @param {string} param0.baseFile
 * @returns {Promise<number>}
 */
async function append({ inputFile, baseFile }) {
    const input = (0, utils_1.normalizePath)(inputFile);
    const output = (0, utils_1.normalizePath)(baseFile);
    const [inputExists, outputExists, inputStats] = await Promise.all([fs_extra_1.default.exists(input), fs_extra_1.default.exists(output), fs_extra_1.default.stat(input)]);
    if (!inputExists) {
        throw new Error("Input file does not exist.");
    }
    if (!outputExists) {
        throw new Error("Output file does not exist.");
    }
    await pipelineAsync(fs_extra_1.default.createReadStream(input, {
        highWaterMark: constants_1.BUFFER_SIZE
    }), fs_extra_1.default.createWriteStream(output, { flags: "a" }));
    return inputStats.size;
}
exports.append = append;
exports.default = append;
//# sourceMappingURL=append.js.map