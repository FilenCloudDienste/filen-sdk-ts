"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSettings = void 0;
/**
 * UserSettings
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserSettings
 * @typedef {UserSettings}
 */
class UserSettings {
    /**
     * Creates an instance of UserSettings.
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
     * Get the user's settings/info.
     * @date 2/10/2024 - 1:23:53 AM
     *
     * @public
     * @async
     * @returns {Promise<UserSettingsResponse>}
     */
    async fetch() {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/user/settings"
        });
        return response;
    }
}
exports.UserSettings = UserSettings;
exports.default = UserSettings;
//# sourceMappingURL=settings.js.map