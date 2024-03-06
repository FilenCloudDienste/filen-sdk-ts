/**
 * FileTrash
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileTrash
 * @typedef {FileTrash}
 */
export class FileTrash {
    apiClient;
    /**
     * Creates an instance of FileTrash.
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
     * Move a file to the trash bin.
     * @date 2/9/2024 - 4:59:21 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<DirPresentResponse>}
     */
    async fetch({ uuid }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/file/trash",
            data: {
                uuid
            }
        });
    }
}
export default FileTrash;
//# sourceMappingURL=trash.js.map