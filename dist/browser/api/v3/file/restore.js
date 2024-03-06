/**
 * FileRestore
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileRestore
 * @typedef {FileRestore}
 */
export class FileRestore {
    apiClient;
    /**
     * Creates an instance of FileRestore.
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
     * Restore a file from the trash bin.
     * @date 2/9/2024 - 7:13:10 PM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    async fetch({ uuid }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/file/restore",
            data: {
                uuid
            }
        });
    }
}
export default FileRestore;
//# sourceMappingURL=restore.js.map