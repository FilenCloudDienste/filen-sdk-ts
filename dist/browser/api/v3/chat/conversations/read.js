/**
 * ChatConversationsRead
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsRead
 * @typedef {ChatConversationsRead}
 */
export class ChatConversationsRead {
    apiClient;
    /**
     * Creates an instance of ChatConversationsRead.
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
     * Mark all messages in a chat conversation as read.
     * @date 2/13/2024 - 5:01:39 AM
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
            endpoint: "/v3/chat/conversations/read",
            data: {
                uuid
            }
        });
    }
}
export default ChatConversationsRead;
//# sourceMappingURL=read.js.map