"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesTagsFavorite = void 0;
/**
 * NotesTagsFavorite
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class NotesTagsFavorite
 * @typedef {NotesTagsFavorite}
 */
class NotesTagsFavorite {
    /**
     * Creates an instance of NotesTagsFavorite.
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
     * Toggle the favorite status of a note tag.
     * @date 2/13/2024 - 6:24:56 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, favorite: boolean }} param0
     * @param {string} param0.uuid
     * @param {boolean} param0.favorite
     * @returns {Promise<void>}
     */
    async fetch({ uuid, favorite }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/notes/tags/favorite",
            data: {
                uuid,
                favorite
            }
        });
    }
}
exports.NotesTagsFavorite = NotesTagsFavorite;
exports.default = NotesTagsFavorite;
//# sourceMappingURL=favorite.js.map