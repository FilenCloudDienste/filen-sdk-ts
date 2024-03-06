"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemLinked = void 0;
/**
 * ItemLinked
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ItemLinked
 * @typedef {ItemLinked}
 */
class ItemLinked {
    /**
     * Creates an instance of ItemLinked.
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
     * Get public link information about an item.
     * @date 2/9/2024 - 4:30:58 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<ItemLinkedResponse>}
     */
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/item/linked",
            data: {
                uuid
            }
        });
        return response;
    }
}
exports.ItemLinked = ItemLinked;
exports.default = ItemLinked;
//# sourceMappingURL=linked.js.map