import type APIClient from "../../../client";
/**
 * ChatConversationsLeave
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsLeave
 * @typedef {ChatConversationsLeave}
 */
export declare class ChatConversationsLeave {
    private readonly apiClient;
    /**
     * Creates an instance of ChatConversationsLeave.
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
     * Leave a chat conversation.
     * @date 2/13/2024 - 6:33:49 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; }} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<void>;
}
export default ChatConversationsLeave;
