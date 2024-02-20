"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessageEmbedDisable = void 0;
/**
 * ChatMessageEmbedDisable
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatMessageEmbedDisable
 * @typedef {ChatMessageEmbedDisable}
 */
class ChatMessageEmbedDisable {
    /**
     * Creates an instance of ChatMessageEmbedDisable.
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
     * Disable a chat embed from displaying.
     * @date 2/13/2024 - 6:29:00 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    async fetch({ uuid }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/chat/message/embed/disable",
            data: {
                uuid
            }
        });
    }
}
exports.ChatMessageEmbedDisable = ChatMessageEmbedDisable;
exports.default = ChatMessageEmbedDisable;
//# sourceMappingURL=disable.js.map