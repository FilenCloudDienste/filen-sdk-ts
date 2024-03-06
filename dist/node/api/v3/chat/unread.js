"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatUnread = void 0;
/**
 * ChatUnread
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatUnread
 * @typedef {ChatConversationsUnread}
 */
class ChatUnread {
    /**
     * Creates an instance of ChatUnread.
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
     * Fetch overall unread messages count.
     * @date 2/13/2024 - 5:05:26 AM
     *
     * @public
     * @async
     * @returns {Promise<ChatUnreadResponse>}
     */
    async fetch() {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/chat/unread"
        });
        return response;
    }
}
exports.ChatUnread = ChatUnread;
exports.default = ChatUnread;
//# sourceMappingURL=unread.js.map