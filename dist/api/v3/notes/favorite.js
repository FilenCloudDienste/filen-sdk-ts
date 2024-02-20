"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesFavorite = void 0;
/**
 * NotesFavorite
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesFavorite
 * @typedef {NotesFavorite}
 */
class NotesFavorite {
    /**
     * Creates an instance of NotesFavorite.
     * @date 2/1/2024 - 3:19:15 PM
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
     * Toggle the favorite status of a note.
     * @date 2/13/2024 - 5:40:57 AM
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
            endpoint: "/v3/notes/favorite",
            data: {
                uuid,
                favorite
            }
        });
    }
}
exports.NotesFavorite = NotesFavorite;
exports.default = NotesFavorite;
//# sourceMappingURL=favorite.js.map