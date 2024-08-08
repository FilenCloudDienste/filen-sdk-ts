/**
 * FileGet
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileGet
 * @typedef {FileGet}
 */
export class FileGet {
    apiClient;
    /**
     * Creates an instance of FileGet.
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
     * Get file info.
     *
     * @public
     * @async
     * @param {{ uuid: string; }} param0
     * @param {string} param0.uuid
     * @returns {Promise<FileGetResponse>}
     */
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/file",
            data: {
                uuid
            }
        });
        return response;
    }
}
export default FileGet;
//# sourceMappingURL=get.js.map