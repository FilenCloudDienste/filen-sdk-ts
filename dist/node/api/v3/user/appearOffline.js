"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAppearOffline = void 0;
/**
 * UserAppearOffline
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserAppearOffline
 * @typedef {UserAppearOffline}
 */
class UserAppearOffline {
    /**
     * Creates an instance of UserAppearOffline.
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
     * Toggle appear offline status.
     * @date 2/13/2024 - 6:10:56 AM
     *
     * @public
     * @async
     * @param {{ appearOffline: boolean }} param0
     * @param {boolean} param0.appearOffline
     * @returns {Promise<void>}
     */
    async fetch({ appearOffline }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/appearOffline",
            data: {
                appearOffline
            }
        });
    }
}
exports.UserAppearOffline = UserAppearOffline;
exports.default = UserAppearOffline;
//# sourceMappingURL=appearOffline.js.map