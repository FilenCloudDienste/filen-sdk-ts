"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesDelete = void 0;
/**
 * NotesDelete
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesDelete
 * @typedef {NotesDelete}
 */
class NotesDelete {
    /**
     * Creates an instance of NotesDelete.
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
     * Delete a note.
     * @date 2/13/2024 - 5:31:43 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; }} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    async fetch({ uuid }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/notes/delete",
            data: {
                uuid
            }
        });
    }
}
exports.NotesDelete = NotesDelete;
exports.default = NotesDelete;
//# sourceMappingURL=delete.js.map