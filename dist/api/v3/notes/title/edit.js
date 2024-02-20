"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteTitleEdit = void 0;
/**
 * NoteTitleEdit
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NoteTitleEdit
 * @typedef {NoteTitleEdit}
 */
class NoteTitleEdit {
    /**
     * Creates an instance of NoteTitleEdit.
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
     * Edit a note's title.
     * @date 2/13/2024 - 5:30:02 AM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		title: string
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.title
     * @returns {Promise<void>}
     */
    async fetch({ uuid, title }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/notes/title/edit",
            data: {
                uuid,
                title
            }
        });
    }
}
exports.NoteTitleEdit = NoteTitleEdit;
exports.default = NoteTitleEdit;
//# sourceMappingURL=edit.js.map