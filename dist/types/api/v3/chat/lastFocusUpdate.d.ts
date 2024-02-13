import type APIClient from "../../client";
export type ChatLastFocusValues = {
    uuid: string;
    lastFocus: number;
};
/**
 * ChatLastFocusUpdate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatLastFocusUpdate
 * @typedef {ChatLastFocusUpdate}
 */
export declare class ChatLastFocusUpdate {
    private readonly apiClient;
    /**
     * Creates an instance of ChatLastFocusUpdate.
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
     * Update last focus values.
     * @date 2/13/2024 - 6:37:14 AM
     *
     * @public
     * @async
     * @param {{ conversations: ChatLastFocusValues[] }} param0
     * @param {{}} param0.conversations
     * @returns {Promise<void>}
     */
    fetch({ conversations }: {
        conversations: ChatLastFocusValues[];
    }): Promise<void>;
}
export default ChatLastFocusUpdate;
