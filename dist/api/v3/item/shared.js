"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemShared = void 0;
/**
 * ItemShared
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ItemShared
 * @typedef {ItemShared}
 */
class ItemShared {
    /**
     * Creates an instance of ItemShared.
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
     * Get sharing information about an item.
     * @date 2/9/2024 - 4:30:58 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<ItemSharedResponse>}
     */
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/item/shared",
            data: {
                uuid
            }
        });
        return response;
    }
}
exports.ItemShared = ItemShared;
exports.default = ItemShared;
//# sourceMappingURL=shared.js.map