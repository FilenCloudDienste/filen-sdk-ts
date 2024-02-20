"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemFavorite = void 0;
/**
 * ItemFavorite
 * @date 2/9/2024 - 5:39:37 AM
 *
 * @export
 * @class ItemFavorite
 * @typedef {ItemFavorite}
 */
class ItemFavorite {
    /**
     * Creates an instance of ItemFavorite.
     * @date 2/9/2024 - 5:39:43 AM
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
     * Toggle favorite status of an item.
     * @date 2/9/2024 - 5:39:46 AM
     *
     * @public
     * @async
     * @param {({ uuid: string; type: "file" | "folder"; favorite: boolean })} param0
     * @param {string} param0.uuid
     * @param {("file" | "folder")} param0.type
     * @param {boolean} param0.favorite
     * @returns {Promise<void>}
     */
    async fetch({ uuid, type, favorite }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/item/favorite",
            data: {
                uuid,
                type,
                value: favorite ? 1 : 0
            }
        });
    }
}
exports.ItemFavorite = ItemFavorite;
exports.default = ItemFavorite;
//# sourceMappingURL=favorite.js.map