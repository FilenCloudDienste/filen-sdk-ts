"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesTag = void 0;
/**
 * NotesTag
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class NotesTag
 * @typedef {NotesTag}
 */
class NotesTag {
    /**
     * Creates an instance of NotesTag.
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
     * Tag a note.
     * @date 2/13/2024 - 6:26:37 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; tag: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.tag
     * @returns {Promise<void>}
     */
    async fetch({ uuid, tag }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/notes/tag",
            data: {
                uuid,
                tag
            }
        });
    }
}
exports.NotesTag = NotesTag;
exports.default = NotesTag;
//# sourceMappingURL=tag.js.map