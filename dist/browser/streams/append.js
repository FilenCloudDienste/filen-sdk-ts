import fs from "fs-extra";
import { pipeline } from "stream";
import { promisify } from "util";
import { BUFFER_SIZE } from "../constants";
import { normalizePath } from "../utils";
const pipelineAsync = promisify(pipeline);
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
export async function append({ inputFile, baseFile }) {
    const input = normalizePath(inputFile);
    const output = normalizePath(baseFile);
    const [inputExists, outputExists, inputStats] = await Promise.all([fs.exists(input), fs.exists(output), fs.stat(input)]);
    if (!inputExists) {
        throw new Error("Input file does not exist.");
    }
    if (!outputExists) {
        throw new Error("Output file does not exist.");
    }
    await pipelineAsync(fs.createReadStream(input, {
        highWaterMark: BUFFER_SIZE
    }), fs.createWriteStream(output, { flags: "a" }));
    return inputStats.size;
}
export default append;
//# sourceMappingURL=append.js.map