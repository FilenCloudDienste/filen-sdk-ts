"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesTypeChange = void 0;
/**
 * NotesTypeChange
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesTypeChange
 * @typedef {NotesTypeChange}
 */
class NotesTypeChange {
    /**
     * Creates an instance of NotesTypeChange.
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
     * Change a note's type.
     * @date 2/13/2024 - 5:39:10 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, type: NoteType, preview: string, content: string }} param0
     * @param {string} param0.uuid
     * @param {NoteType} param0.type
     * @param {string} param0.preview
     * @param {string} param0.content
     * @returns {Promise<void>}
     */
    async fetch({ uuid, type, preview, content }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/notes/type/change",
            data: {
                uuid,
                type,
                preview,
                content
            }
        });
    }
}
exports.NotesTypeChange = NotesTypeChange;
exports.default = NotesTypeChange;
//# sourceMappingURL=change.js.map