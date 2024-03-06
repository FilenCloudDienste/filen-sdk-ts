/**
 * ChatDelete
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatDelete
 * @typedef {ChatDelete}
 */
export class ChatDelete {
    apiClient;
    /**
     * Creates an instance of ChatDelete.
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
     * Delete a chat conversation.
     * @date 2/13/2024 - 5:19:07 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    async fetch({ uuid }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/chat/delete",
            data: {
                uuid
            }
        });
    }
}
export default ChatDelete;
//# sourceMappingURL=delete.js.map