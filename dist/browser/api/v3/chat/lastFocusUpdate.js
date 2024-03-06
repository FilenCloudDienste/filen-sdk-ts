/**
 * ChatLastFocusUpdate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatLastFocusUpdate
 * @typedef {ChatLastFocusUpdate}
 */
export class ChatLastFocusUpdate {
    apiClient;
    /**
     * Creates an instance of ChatLastFocusUpdate.
     * @date 2/1/2024 - 8:16:39 PM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }) {
        this.apiClient = apiClient;
    }
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
    async fetch({ conversations }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/chat/lastFocus",
            data: {
                conversations
            }
        });
    }
}
export default ChatLastFocusUpdate;
//# sourceMappingURL=lastFocusUpdate.js.map