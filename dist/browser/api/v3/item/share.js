/**
 * ItemShare
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ItemShare
 * @typedef {ItemShare}
 */
export class ItemShare {
    apiClient;
    /**
     * Creates an instance of ItemShare.
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
     * Share an item.
     * @date 2/9/2024 - 4:27:13 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; parent: string; email: string; type: "file" | "folder"; metadata: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.parent
     * @param {string} param0.email
     * @param {"file" | "folder"} param0.type
     * @param {string} param0.metadata
     * @returns {Promise<void>}
     */
    async fetch({ uuid, parent, email, type, metadata }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/item/share",
            data: {
                uuid,
                parent,
                email,
                type,
                metadata
            }
        });
    }
}
export default ItemShare;
//# sourceMappingURL=share.js.map