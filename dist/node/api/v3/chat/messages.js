"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessages = void 0;
/**
 * ChatMessages
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatMessages
 * @typedef {ChatMessages}
 */
class ChatMessages {
    /**
     * Creates an instance of ChatMessages.
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
     * Fetch chat messages from the given timestamp ordered DESC. Can be used for pagination.
     * @date 2/20/2024 - 5:57:33 AM
     *
     * @public
     * @async
     * @param {{
     * 		conversation: string
     * 		timestamp: number
     * 	}} param0
     * @param {string} param0.conversation
     * @param {number} param0.timestamp
     * @returns {Promise<ChatMessage[]>}
     */
    async fetch({ conversation, timestamp }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/chat/messages",
            data: {
                conversation,
                timestamp
            }
        });
        return response;
    }
}
exports.ChatMessages = ChatMessages;
exports.default = ChatMessages;
//# sourceMappingURL=messages.js.map