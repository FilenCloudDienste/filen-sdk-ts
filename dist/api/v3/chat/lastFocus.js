"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatLastFocus = void 0;
/**
 * ChatLastFocus
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatLastFocus
 * @typedef {ChatLastFocus}
 */
class ChatLastFocus {
    /**
     * Creates an instance of ChatLastFocus.
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
     * Fetch chat last focus values.
     * @date 2/13/2024 - 6:40:39 AM
     *
     * @public
     * @async
     * @returns {Promise<ChatLastFocusValues[]>}
     */
    async fetch() {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/chat/lastFocus"
        });
        return response;
    }
}
exports.ChatLastFocus = ChatLastFocus;
exports.default = ChatLastFocus;
//# sourceMappingURL=lastFocus.js.map