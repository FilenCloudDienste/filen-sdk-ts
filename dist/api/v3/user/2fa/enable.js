"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User2FAEnable = void 0;
/**
 * User2FAEnable
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class User2FAEnable
 * @typedef {User2FAEnable}
 */
class User2FAEnable {
    /**
     * Creates an instance of User2FAEnable.
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
     * Enable 2FA.
     * @date 2/10/2024 - 1:59:21 AM
     *
     * @public
     * @async
     * @param {{
     * 		code: string
     * 	}} param0
     * @param {string} param0.code
     * @returns {Promise<User2FAEnableResponse>}
     */
    async fetch({ code }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/2fa/enable",
            data: {
                code
            }
        });
        return response;
    }
}
exports.User2FAEnable = User2FAEnable;
exports.default = User2FAEnable;
//# sourceMappingURL=enable.js.map