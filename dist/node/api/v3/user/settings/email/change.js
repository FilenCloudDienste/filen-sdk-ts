"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSettingsEmailChange = void 0;
/**
 * UserSettingsEmailChange
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserSettingsEmailChange
 * @typedef {UserSettingsEmailChange}
 */
class UserSettingsEmailChange {
    /**
     * Creates an instance of UserSettingsEmailChange.
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
     * Change the user's email. Requires derived hashed password.
     * @date 2/10/2024 - 1:40:31 AM
     *
     * @public
     * @async
     * @param {{ email: string, password: string, authVersion: AuthVersion }} param0
     * @param {string} param0.email
     * @param {string} param0.password
     * @param {AuthVersion} param0.authVersion
     * @returns {Promise<void>}
     */
    async fetch({ email, password, authVersion }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/settings/email/change",
            data: {
                email,
                password,
                authVersion
            }
        });
    }
}
exports.UserSettingsEmailChange = UserSettingsEmailChange;
exports.default = UserSettingsEmailChange;
//# sourceMappingURL=change.js.map