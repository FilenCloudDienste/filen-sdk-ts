"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatConversations = void 0;
/**
 * ChatConversations
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversations
 * @typedef {ChatConversations}
 */
class ChatConversations {
    /**
     * Creates an instance of ChatConversations.
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
     * Fetch all chat conversations.
     * @date 2/13/2024 - 4:44:37 AM
     *
     * @public
     * @async
     * @returns {Promise<ChatConversation[]>}
     */
    async fetch() {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/chat/conversations"
        });
        return response;
    }
}
exports.ChatConversations = ChatConversations;
exports.default = ChatConversations;
//# sourceMappingURL=conversations.js.map