"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesTags = void 0;
/**
 * NotesTags
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class NotesTags
 * @typedef {NotesTags}
 */
class NotesTags {
    /**
     * Creates an instance of NotesTags.
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
     * Fetch all note tags.
     * @date 2/13/2024 - 6:18:25 AM
     *
     * @public
     * @async
     * @returns {Promise<NotesTagsResponse>}
     */
    async fetch() {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/notes/tags"
        });
        return response;
    }
}
exports.NotesTags = NotesTags;
exports.default = NotesTags;
//# sourceMappingURL=tags.js.map