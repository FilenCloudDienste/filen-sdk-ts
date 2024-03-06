"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesHistoryRestore = void 0;
/**
 * NotesHistoryRestore
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesHistoryRestore
 * @typedef {NotesHistoryRestore}
 */
class NotesHistoryRestore {
    /**
     * Creates an instance of NotesHistoryRestore.
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
     * Restore a note from history.
     * @date 2/13/2024 - 5:45:45 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; id: number }} param0
     * @param {string} param0.uuid
     * @param {number} param0.id
     * @returns {Promise<void>}
     */
    async fetch({ uuid, id }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/notes/history/restore",
            data: {
                uuid,
                id
            }
        });
    }
}
exports.NotesHistoryRestore = NotesHistoryRestore;
exports.default = NotesHistoryRestore;
//# sourceMappingURL=restore.js.map