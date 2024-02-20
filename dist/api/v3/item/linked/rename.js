"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemLinkedRename = void 0;
/**
 * ItemLinkedRename
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ItemLinkedRename
 * @typedef {ItemLinkedRename}
 */
class ItemLinkedRename {
    /**
     * Creates an instance of ItemLinkedRename.
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
     * Rename a public linked item
     * @date 2/9/2024 - 4:37:35 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; linkUUID: string; metadata: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.linkUUID
     * @param {string} param0.metadata
     * @returns {Promise<void>}
     */
    async fetch({ uuid, linkUUID, metadata }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/item/linked/rename",
            data: {
                uuid,
                linkUUID,
                metadata
            }
        });
    }
}
exports.ItemLinkedRename = ItemLinkedRename;
exports.default = ItemLinkedRename;
//# sourceMappingURL=rename.js.map