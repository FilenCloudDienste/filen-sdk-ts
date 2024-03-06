/**
 * ChatConversationsParticipantsAdd
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsParticipantsAdd
 * @typedef {ChatConversationsParticipantsAdd}
 */
export class ChatConversationsParticipantsAdd {
    apiClient;
    /**
     * Creates an instance of ChatConversationsParticipantsAdd.
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
     * Add a participant to a chat conversation.
     * @date 2/13/2024 - 4:56:51 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; contactUUID: string; metadata: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.contactUUID
     * @param {string} param0.metadata
     * @returns {Promise<void>}
     */
    async fetch({ uuid, contactUUID, metadata }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/chat/conversations/participants/add",
            data: {
                uuid,
                contactUUID,
                metadata
            }
        });
    }
}
export default ChatConversationsParticipantsAdd;
//# sourceMappingURL=add.js.map