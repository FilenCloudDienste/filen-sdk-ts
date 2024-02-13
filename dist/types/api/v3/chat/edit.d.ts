import type APIClient from "../../client";
/**
 * ChatEdit
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatEdit
 * @typedef {ChatEdit}
 */
export declare class ChatEdit {
    private readonly apiClient;
    /**
     * Creates an instance of ChatEdit.
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
     * Edit a chat message.
     * @date 2/13/2024 - 4:53:28 AM
     *
     * @public
     * @async
     * @param {{
     * 		conversation: string
     * 		uuid: string
     * 		message: string
     * 	}} param0
     * @param {string} param0.conversation
     * @param {string} param0.uuid
     * @param {string} param0.message
     * @returns {Promise<void>}
     */
    fetch({ conversation, uuid, message }: {
        conversation: string;
        uuid: string;
        message: string;
    }): Promise<void>;
}
export default ChatEdit;
