"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLoginAlerts = void 0;
/**
 * UserLoginAlerts
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserLoginAlerts
 * @typedef {UserLoginAlerts}
 */
class UserLoginAlerts {
    /**
     * Creates an instance of UserLoginAlerts.
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
     * Toggle login alerts.
     * @date 2/10/2024 - 2:31:30 AM
     *
     * @public
     * @async
     * @param {{ enable: boolean }} param0
     * @param {boolean} param0.enable
     * @returns {Promise<void>}
     */
    async fetch({ enable }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/loginAlerts",
            data: {
                enabled: enable ? 1 : 0
            }
        });
    }
}
exports.UserLoginAlerts = UserLoginAlerts;
exports.default = UserLoginAlerts;
//# sourceMappingURL=loginAlerts.js.map