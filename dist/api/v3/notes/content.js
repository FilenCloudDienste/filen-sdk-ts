"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesContent = void 0;
/**
 * NotesContent
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesContent
 * @typedef {NotesContent}
 */
class NotesContent {
    /**
     * Creates an instance of NotesContent.
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
     * Fetch note content.
     * @date 2/13/2024 - 5:24:20 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<NotesContentResponse>}
     */
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/notes/content",
            data: {
                uuid
            }
        });
        return response;
    }
}
exports.NotesContent = NotesContent;
exports.default = NotesContent;
//# sourceMappingURL=content.js.map