/**
 * ChatConversationsLeave
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsLeave
 * @typedef {ChatConversationsLeave}
 */
export class ChatConversationsLeave {
    apiClient;
    /**
     * Creates an instance of ChatConversationsLeave.
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
     * Leave a chat conversation.
     * @date 2/13/2024 - 6:33:49 AM
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
            endpoint: "/v3/chat/conversations/leave",
            data: {
                uuid
            }
        });
    }
}
export default ChatConversationsLeave;
//# sourceMappingURL=leave.js.map