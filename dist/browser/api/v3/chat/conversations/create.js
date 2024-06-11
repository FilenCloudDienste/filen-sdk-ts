/**
 * ChatConversationsCreate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsCreate
 * @typedef {ChatConversationsCreate}
 */
export class ChatConversationsCreate {
    apiClient;
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
     *
     * @public
     * @async
     * @param {{ uuid: string; metadata: string, ownerMetadata: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.metadata
     * @param {string} param0.ownerMetadata
     * @returns {Promise<void>}
     */
    async fetch({ uuid, metadata, ownerMetadata }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/chat/conversations/create",
            data: {
                uuid,
                metadata,
                ownerMetadata
            }
        });
    }
}
export default ChatConversationsCreate;
//# sourceMappingURL=create.js.map