"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesTagsRename = void 0;
/**
 * NotesTagsRename
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class NotesTagsRename
 * @typedef {NotesTagsRename}
 */
class NotesTagsRename {
    /**
     * Creates an instance of NotesTagsRename.
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
     * Rename a note tag.
     * @date 2/13/2024 - 6:22:00 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, name: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.name
     * @returns {Promise<void>}
     */
    async fetch({ uuid, name }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/notes/tags/rename",
            data: {
                uuid,
                name
            }
        });
    }
}
exports.NotesTagsRename = NotesTagsRename;
exports.default = NotesTagsRename;
//# sourceMappingURL=rename.js.map