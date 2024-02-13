import type APIClient from "../../../client";
export type ChatConversationsOnlineUser = {
    userId: number;
    lastActive: number;
    appearOffline: boolean;
};
export type ChatConversationsOnlineResponse = ChatConversationsOnlineUser[];
/**
 * ChatConversationsOnline
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsOnline
 * @typedef {ChatConversationsOnline}
 */
export declare class ChatConversationsOnline {
    private readonly apiClient;
    /**
     * Creates an instance of ChatConversationsOnline.
     * @date 2/1/2024 - 8:16:39 PM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }: {
        apiClient: APIClient;
    });
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
    fetch({ conversation }: {
        conversation: string;
    }): Promise<ChatConversationsOnlineResponse>;
}
export default ChatConversationsOnline;
