"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatConversationsNameEdit = void 0;
/**
 * ChatConversationsNameEdit
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsNameEdit
 * @typedef {ChatConversationsNameEdit}
 */
class ChatConversationsNameEdit {
    /**
     * Creates an instance of ChatConversationsNameEdit.
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
     * Edit conversation name.
     * @date 2/13/2024 - 4:49:46 AM
     *
     * @public
     * @async
     * @param {{uuid: string, name: string}} param0
     * @param {string} param0.uuid
     * @param {string} param0.name
     * @returns {Promise<void>}
     */
    async fetch({ uuid, name }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/chat/conversations/name/edit",
            data: {
                uuid,
                name
            }
        });
    }
}
exports.ChatConversationsNameEdit = ChatConversationsNameEdit;
exports.default = ChatConversationsNameEdit;
//# sourceMappingURL=edit.js.map