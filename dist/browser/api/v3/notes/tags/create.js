/**
 * NotesTagsCreate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class NotesTagsCreate
 * @typedef {NotesTagsCreate}
 */
export class NotesTagsCreate {
    apiClient;
    /**
     * Creates an instance of NotesTagsCreate.
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
     * Create a note tag.
     * @date 2/13/2024 - 6:20:19 AM
     *
     * @public
     * @async
     * @param {{ name: string }} param0
     * @param {string} param0.name
     * @returns {Promise<NotesTagsCreateResponse>}
     */
    async fetch({ name }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/notes/tags/create",
            data: {
                name
            }
        });
        return response;
    }
}
export default NotesTagsCreate;
//# sourceMappingURL=create.js.map