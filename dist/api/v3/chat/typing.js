"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatTyping = void 0;
/**
 * ChatTyping
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatTyping
 * @typedef {ChatTyping}
 */
class ChatTyping {
    /**
     * Creates an instance of ChatTyping.
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
     * Send a typing event to a chat conversation.
     * @date 2/13/2024 - 4:59:42 AM
     *
     * @public
     * @async
     * @param {{
     * 		conversation: string
     * 		type: ChatTypingType
     * 	}} param0
     * @param {string} param0.conversation
     * @param {ChatTypingType} param0.type
     * @returns {Promise<void>}
     */
    async fetch({ conversation, type }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/chat/typing",
            data: {
                conversation,
                type
            }
        });
    }
}
exports.ChatTyping = ChatTyping;
exports.default = ChatTyping;
//# sourceMappingURL=typing.js.map