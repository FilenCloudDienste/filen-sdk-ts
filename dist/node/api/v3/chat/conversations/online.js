"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatConversationsOnline = void 0;
/**
 * ChatConversationsOnline
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsOnline
 * @typedef {ChatConversationsOnline}
 */
class ChatConversationsOnline {
    /**
     * Creates an instance of ChatConversationsOnline.
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
     * Fetch online status info of all participants in a chat conversation.
     * @date 2/13/2024 - 5:17:03 AM
     *
     * @public
     * @async
     * @param {{ conversation: string }} param0
     * @param {string} param0.conversation
     * @returns {Promise<ChatConversationsOnlineResponse>}
     */
    async fetch({ conversation }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/chat/conversations/online",
            data: {
                conversation
            }
        });
        return response;
    }
}
exports.ChatConversationsOnline = ChatConversationsOnline;
exports.default = ChatConversationsOnline;
//# sourceMappingURL=online.js.map