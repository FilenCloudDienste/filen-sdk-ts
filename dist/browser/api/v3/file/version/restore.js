/**
 * FileVersionRestore
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileVersionRestore
 * @typedef {FileVersionRestore}
 */
export class FileVersionRestore {
    apiClient;
    /**
     * Creates an instance of FileVersionRestore.
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
     * Restore an old file version.
     * @date 2/9/2024 - 7:19:29 PM
     *
     * @public
     * @async
     * @param {{ uuid: string; currentUUID: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.currentUUID
     * @returns {Promise<void>}
     */
    async fetch({ uuid, currentUUID }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/file/version/restore",
            data: {
                uuid,
                current: currentUUID
            }
        });
    }
}
export default FileVersionRestore;
//# sourceMappingURL=restore.js.map