"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLastActiveDesktop = void 0;
/**
 * UserLastActiveDesktop
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserLastActiveDesktop
 * @typedef {UserLastActiveDesktop}
 */
class UserLastActiveDesktop {
    /**
     * Creates an instance of UserLastActiveDesktop.
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
     * Update last active timestamp for the desktop platform.
     * @date 2/13/2024 - 6:44:14 AM
     *
     * @public
     * @async
     * @param {{ timestamp: number }} param0
     * @param {number} param0.timestamp
     * @returns {Promise<void>}
     */
    async fetch({ timestamp }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/lastActive/desktop",
            data: {
                timestamp
            }
        });
    }
}
exports.UserLastActiveDesktop = UserLastActiveDesktop;
exports.default = UserLastActiveDesktop;
//# sourceMappingURL=desktop.js.map