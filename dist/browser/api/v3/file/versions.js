/**
 * FileVersions
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileVersions
 * @typedef {FileVersions}
 */
export class FileVersions {
    apiClient;
    /**
     * Creates an instance of FileVersions.
     * @date 2/1/2024 - 8:16:39 PM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }) {
        this.apiClient = apiClient;
    }
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
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/file/versions",
            data: {
                uuid
            }
        });
        return response;
    }
}
export default FileVersions;
//# sourceMappingURL=versions.js.map