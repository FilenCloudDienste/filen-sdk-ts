import type APIClient from "../../../../client";
/**
 * ChatMessageEmbedDisable
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatMessageEmbedDisable
 * @typedef {ChatMessageEmbedDisable}
 */
export declare class ChatMessageEmbedDisable {
    private readonly apiClient;
    /**
     * Creates an instance of ChatMessageEmbedDisable.
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
     * Disable a chat embed from displaying.
     * @date 2/13/2024 - 6:29:00 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<void>;
}
export default ChatMessageEmbedDisable;
