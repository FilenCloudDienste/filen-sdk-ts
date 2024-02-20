"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesHistory = void 0;
/**
 * NotesHistory
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesHistory
 * @typedef {NotesHistory}
 */
class NotesHistory {
    /**
     * Creates an instance of NotesHistory.
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
     * Fetch a note's history.
     * @date 2/13/2024 - 5:43:55 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<NotesHistoryResponse>}
     */
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/notes/history",
            data: {
                uuid
            }
        });
        return response;
    }
}
exports.NotesHistory = NotesHistory;
exports.default = NotesHistory;
//# sourceMappingURL=history.js.map