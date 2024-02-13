import type APIClient from "../../../client";
export type ChatConversationsUnreadResponse = {
    unread: number;
};
/**
 * ChatConversationsUnread
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsUnread
 * @typedef {ChatConversationsUnread}
 */
export declare class ChatConversationsUnread {
    private readonly apiClient;
    /**
     * Creates an instance of ChatConversationsUnread.
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
     * Fetch unread messages count of a chat conversation.
     * @date 2/13/2024 - 5:01:39 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<ChatConversationsUnreadResponse>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<ChatConversationsUnreadResponse>;
}
export default ChatConversationsUnread;
