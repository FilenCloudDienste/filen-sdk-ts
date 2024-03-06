/**
 * DirLinkContent
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirLinkContent
 * @typedef {DirLinkContent}
 */
export class DirLinkContent {
    apiClient;
    /**
     * Creates an instance of DirLinkContent.
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
     * Get contents of a directory public link.
     * @date 2/10/2024 - 2:20:01 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, password: string, parent: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.password
     * @param {string} param0.parent
     * @returns {Promise<DirLinkContentResponse>}
     */
    async fetch({ uuid, password, parent }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/dir/link/content",
            data: {
                uuid,
                password,
                parent
            }
        });
        return response;
    }
}
export default DirLinkContent;
//# sourceMappingURL=content.js.map