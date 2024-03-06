"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesCreate = void 0;
/**
 * NotesCreate
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesCreate
 * @typedef {NotesCreate}
 */
class NotesCreate {
    /**
     * Creates an instance of NotesCreate.
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
     * Create a note.
     * @date 2/13/2024 - 5:26:26 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, title: string, metadata: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.title
     * @param {string} param0.metadata
     * @returns {Promise<void>}
     */
    async fetch({ uuid, title, metadata }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/notes/create",
            data: {
                uuid,
                title,
                metadata
            }
        });
    }
}
exports.NotesCreate = NotesCreate;
exports.default = NotesCreate;
//# sourceMappingURL=create.js.map