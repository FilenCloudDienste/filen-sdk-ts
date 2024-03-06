/**
 * ChatConversationsParticipantsRemove
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsParticipantsRemove
 * @typedef {ChatConversationsParticipantsRemove}
 */
export class ChatConversationsParticipantsRemove {
    apiClient;
    /**
     * Creates an instance of ChatConversationsParticipantsRemove.
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
     * Remove a participant from a chat conversation.
     * @date 2/13/2024 - 6:32:02 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; userId: number }} param0
     * @param {string} param0.uuid
     * @param {number} param0.userId
     * @returns {Promise<void>}
     */
    async fetch({ uuid, userId }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/chat/conversations/participants/remove",
            data: {
                uuid,
                userId
            }
        });
    }
}
export default ChatConversationsParticipantsRemove;
//# sourceMappingURL=remove.js.map