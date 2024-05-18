import type APIClient from "../../client";
export type FileVersion = {
    bucket: string;
    chunks: number;
    metadata: string;
    region: string;
    rm: string;
    timestamp: number;
    uuid: string;
    version: number;
};
export type FileVersionsResponse = {
    versions: FileVersion[];
};
/**
 * FileVersions
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileVersions
 * @typedef {FileVersions}
 */
export declare class FileVersions {
    private readonly apiClient;
    /**
     * Creates an instance of FileVersions.
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
     * Get all versions of a file.
     * @date 2/10/2024 - 1:17:28 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<FileVersionsResponse>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<FileVersionsResponse>;
}
export default FileVersions;
