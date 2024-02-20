"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatConversationsDelete = void 0;
/**
 * ChatConversationsDelete
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsDelete
 * @typedef {ChatConversationsDelete}
 */
class ChatConversationsDelete {
    /**
     * Creates an instance of ChatConversationsDelete.
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
            endpoint: "/v3/chat/conversations/delete",
            data: {
                uuid
            }
        });
    }
}
exports.ChatConversationsDelete = ChatConversationsDelete;
exports.default = ChatConversationsDelete;
//# sourceMappingURL=delete.js.map