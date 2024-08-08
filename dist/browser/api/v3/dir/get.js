/**
 * DirGet
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirGet
 * @typedef {DirGet}
 */
export class DirGet {
    apiClient;
    /**
     * Creates an instance of DirGet.
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
     * Get dir info.
     *
     * @public
     * @async
     * @param {{ uuid: string; }} param0
     * @param {string} param0.uuid
     * @returns {Promise<DirGetResponse>}
     */
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/dir",
            data: {
                uuid
            }
        });
        return response;
    }
}
export default DirGet;
//# sourceMappingURL=get.js.map