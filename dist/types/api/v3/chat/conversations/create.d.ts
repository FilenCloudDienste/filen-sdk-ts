import type APIClient from "../../../client";
/**
 * ChatConversationsCreate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsCreate
 * @typedef {ChatConversationsCreate}
 */
export declare class ChatConversationsCreate {
    private readonly apiClient;
    /**
     * Creates an instance of ChatConversationsCreate.
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
    fetch({ uuid, metadata, ownerMetadata }: {
        uuid: string;
        metadata: string;
        ownerMetadata: string;
    }): Promise<void>;
}
export default ChatConversationsCreate;
