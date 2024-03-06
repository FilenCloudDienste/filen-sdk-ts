"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesRestore = void 0;
/**
 * NotesRestore
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesRestore
 * @typedef {NotesRestore}
 */
class NotesRestore {
    /**
     * Creates an instance of NotesRestore.
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
     * Restore a note.
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
            endpoint: "/v3/notes/restore",
            data: {
                uuid
            }
        });
    }
}
exports.NotesRestore = NotesRestore;
exports.default = NotesRestore;
//# sourceMappingURL=restore.js.map