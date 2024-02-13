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
     * @date 2/13/2024 - 4:55:01 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, metadata: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.metadata
     * @returns {Promise<void>}
     */
    fetch({ uuid, metadata }: {
        uuid: string;
        metadata: string;
    }): Promise<void>;
}
export default ChatConversationsCreate;
