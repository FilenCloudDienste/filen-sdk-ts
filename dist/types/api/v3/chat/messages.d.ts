import type APIClient from "../../client";
export type ChatMessage = {
    conversation: string;
    uuid: string;
    senderId: number;
    senderEmail: string;
    senderAvatar: string | null;
    senderNickName: string;
    message: string;
    replyTo: {
        uuid: string;
        senderId: number;
        senderEmail: string;
        senderAvatar: string;
        senderNickName: string;
        message: string;
    };
    embedDisabled: boolean;
    edited: boolean;
    editedTimestamp: number;
    sentTimestamp: number;
};
/**
 * ChatMessages
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatMessages
 * @typedef {ChatMessages}
 */
export declare class ChatMessages {
    private readonly apiClient;
    /**
     * Creates an instance of ChatMessages.
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
    fetch({ conversation, timestamp }: {
        conversation: string;
        timestamp: number;
    }): Promise<ChatMessage[]>;
}
export default ChatMessages;
