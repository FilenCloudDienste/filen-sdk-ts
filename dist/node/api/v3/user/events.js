"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEvents = void 0;
/**
 * UserEvents
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserEvents
 * @typedef {UserEvents}
 */
class UserEvents {
    /**
     * Creates an instance of UserEvents.
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
     * Get user account events.
     * @date 2/20/2024 - 7:09:44 AM
     *
     * @public
     * @async
     * @param {{
     * 		lastTimestamp: number
     * 		filter: string
     * 	}} param0
     * @param {number} param0.lastTimestamp
     * @param {string} param0.filter
     * @returns {Promise<UserEvent[]>}
     */
    async fetch({ lastTimestamp, filter }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/events",
            data: {
                filter,
                timestamp: lastTimestamp
            }
        });
        return response.events;
    }
}
exports.UserEvents = UserEvents;
exports.default = UserEvents;
//# sourceMappingURL=events.js.map