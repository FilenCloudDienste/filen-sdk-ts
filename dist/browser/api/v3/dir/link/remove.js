/**
 * DirLinkRemove
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirLinkRemove
 * @typedef {DirLinkRemove}
 */
export class DirLinkRemove {
    apiClient;
    /**
     * Creates an instance of DirLinkRemove.
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
     * Remove a directory public link.
     * @date 2/10/2024 - 1:10:50 AM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 	}} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    async fetch({ uuid }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/dir/link/remove",
            data: {
                uuid
            }
        });
    }
}
export default DirLinkRemove;
//# sourceMappingURL=remove.js.map