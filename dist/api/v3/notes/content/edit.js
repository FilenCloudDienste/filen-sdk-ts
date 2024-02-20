"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesContentEdit = void 0;
/**
 * NotesContentEdit
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesContentEdit
 * @typedef {NotesContentEdit}
 */
class NotesContentEdit {
    /**
     * Creates an instance of NotesContentEdit.
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
     * Edit a note.
     * @date 2/13/2024 - 5:28:18 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; preview: string; content: string, type: NoteType }} param0
     * @param {string} param0.uuid
     * @param {string} param0.preview
     * @param {string} param0.content
     * @param {NoteType} param0.type
     * @returns {Promise<void>}
     */
    async fetch({ uuid, preview, content, type }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/notes/content/edit",
            data: {
                uuid,
                preview,
                content,
                type
            }
        });
    }
}
exports.NotesContentEdit = NotesContentEdit;
exports.default = NotesContentEdit;
//# sourceMappingURL=edit.js.map