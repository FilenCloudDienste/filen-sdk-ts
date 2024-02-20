"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatConversationsCreate = void 0;
/**
 * ChatConversationsCreate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsCreate
 * @typedef {ChatConversationsCreate}
 */
class ChatConversationsCreate {
    /**
     * Creates an instance of ChatConversationsCreate.
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
     * Create a chat conversation.
     * @date 2/13/2024 - 4:55:01 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, metadata: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.metadata
     * @returns {Promise<void>}
     */
    async fetch({ uuid, metadata }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/chat/conversations/create",
            data: {
                uuid,
                metadata
            }
        });
    }
}
exports.ChatConversationsCreate = ChatConversationsCreate;
exports.default = ChatConversationsCreate;
//# sourceMappingURL=create.js.map