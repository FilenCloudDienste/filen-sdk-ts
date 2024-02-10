import type APIClient from "../../client";
export type FileExistsResponse = {
    exists: false;
    existsUUID?: string;
} | {
    exists: true;
    existsUUID: string;
};
/**
 * FileExists
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileExists
 * @typedef {FileExists}
 */
export declare class FileExists {
    private readonly apiClient;
    /**
     * Creates an instance of FileExists.
     * @date 2/1/2024 - 8:16:39 PM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }: {
        apiClient: APIClient;
    });
    /**
     * Check if a directory already exists.
     * @date 2/9/2024 - 4:44:34 AM
     *
     * @public
     * @async
     * @param {{
     *         name: string
     *         parent: string
     *     }} param0
     * @param {string} param0.name
     * @param {string} param0.parent
     * @returns {Promise<DirExistsResponse>}
     */
    fetch({ name, parent }: {
        name: string;
        parent: string;
    }): Promise<FileExistsResponse>;
}
export default FileExists;
