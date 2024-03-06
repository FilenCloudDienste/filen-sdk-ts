/**
 * FileLinkInfo
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileLinkInfo
 * @typedef {FileLinkInfo}
 */
export class FileLinkInfo {
    apiClient;
    /**
     * Creates an instance of FileLinkInfo.
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
     * Get file public link info.
     * @date 2/10/2024 - 2:13:05 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, password: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.password
     * @returns {Promise<FileLinkInfoResponse>}
     */
    async fetch({ uuid, password }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/file/link/info",
            data: {
                uuid,
                password
            }
        });
        return response;
    }
}
export default FileLinkInfo;
//# sourceMappingURL=info.js.map