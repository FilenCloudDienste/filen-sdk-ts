"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesPinned = void 0;
/**
 * NotesPinned
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesPinned
 * @typedef {NotesPinned}
 */
class NotesPinned {
    /**
     * Creates an instance of NotesPinned.
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
     * Toggle the pinned status of a note.
     * @date 2/13/2024 - 5:40:57 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, pinned: boolean }} param0
     * @param {string} param0.uuid
     * @param {boolean} param0.pinned
     * @returns {Promise<void>}
     */
    async fetch({ uuid, pinned }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/notes/pinned",
            data: {
                uuid,
                pinned
            }
        });
    }
}
exports.NotesPinned = NotesPinned;
exports.default = NotesPinned;
//# sourceMappingURL=pinned.js.map