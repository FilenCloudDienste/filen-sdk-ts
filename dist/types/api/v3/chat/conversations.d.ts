import type APIClient from "../../client";
export type ChatConversationParticipant = {
    userId: number;
    email: string;
    avatar: string | null;
    nickName: string;
    metadata: string;
    permissionsAdd: boolean;
    addedTimestamp: number;
};
export type ChatConversation = {
    uuid: string;
    lastMessageSender: number;
    lastMessage: string | null;
    lastMessageTimestamp: number;
    lastMessageUUID: string | null;
    ownerId: number;
    ownerMetadata: string | null;
    name: string | null;
    participants: ChatConversationParticipant[];
    createdTimestamp: number;
};
/**
 * ChatConversations
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversations
 * @typedef {ChatConversations}
 */
export declare class ChatConversations {
    private readonly apiClient;
    /**
     * Creates an instance of ChatConversations.
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
     * Fetch all chat conversations.
     * @date 2/13/2024 - 4:44:37 AM
     *
     * @public
     * @async
     * @returns {Promise<ChatConversation[]>}
     */
    fetch(): Promise<ChatConversation[]>;
}
export default ChatConversations;
