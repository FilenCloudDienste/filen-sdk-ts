/**
 * Notes
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class Notes
 * @typedef {Notes}
 */
export class Notes {
    apiClient;
    /**
     * Creates an instance of Notes.
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
     * Fetch all notes.
     * @date 2/13/2024 - 5:21:41 AM
     *
     * @public
     * @async
     * @returns {Promise<NotesResponse>}
     */
    async fetch() {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/notes"
        });
        return response;
    }
}
export default Notes;
//# sourceMappingURL=notes.js.map