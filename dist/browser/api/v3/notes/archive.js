/**
 * NotesArchive
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesArchive
 * @typedef {NotesArchive}
 */
export class NotesArchive {
    apiClient;
    /**
     * Creates an instance of NotesArchive.
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
     * Archive a note.
     * @date 2/13/2024 - 5:31:43 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; }} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    async fetch({ uuid }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/notes/archive",
            data: {
                uuid
            }
        });
    }
}
export default NotesArchive;
//# sourceMappingURL=archive.js.map