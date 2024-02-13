import type APIClient from "../../../../client";
/**
 * ChatConversationsNameEdit
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsNameEdit
 * @typedef {ChatConversationsNameEdit}
 */
export declare class ChatConversationsNameEdit {
    private readonly apiClient;
    /**
     * Creates an instance of ChatConversationsNameEdit.
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
     * Edit conversation name.
     * @date 2/13/2024 - 4:49:46 AM
     *
     * @public
     * @async
     * @param {{uuid: string, name: string}} param0
     * @param {string} param0.uuid
     * @param {string} param0.name
     * @returns {Promise<void>}
     */
    fetch({ uuid, name }: {
        uuid: string;
        name: string;
    }): Promise<void>;
}
export default ChatConversationsNameEdit;
