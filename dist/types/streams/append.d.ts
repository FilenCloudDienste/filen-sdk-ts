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
export declare function append({ inputFile, baseFile }: {
    inputFile: string;
    baseFile: string;
}): Promise<number>;
export default append;
