"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User2FADisable = void 0;
/**
 * User2FADisable
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class User2FADisable
 * @typedef {User2FADisable}
 */
class User2FADisable {
    /**
     * Creates an instance of User2FADisable.
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
     * Disable 2FA.
     * @date 2/10/2024 - 1:59:21 AM
     *
     * @public
     * @async
     * @param {{
     * 		code: string
     * 	}} param0
     * @param {string} param0.code
     * @returns {Promise<void>}
     */
    async fetch({ code }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/2fa/disable",
            data: {
                code
            }
        });
    }
}
exports.User2FADisable = User2FADisable;
exports.default = User2FADisable;
//# sourceMappingURL=disable.js.map