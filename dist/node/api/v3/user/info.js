"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInfo = void 0;
/**
 * UserInfo
 * @date 2/1/2024 - 3:18:55 PM
 *
 * @export
 * @class UserInfo
 * @typedef {UserInfo}
 */
class UserInfo {
    /**
     * Creates an instance of UserInfo.
     * @date 2/1/2024 - 3:19:01 PM
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
     * Fetch user info.
     * @date 2/1/2024 - 3:19:04 PM
     *
     * @public
     * @async
     * @returns {Promise<UserInfoResponse>}
     */
    async fetch({ apiKey }) {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/user/info",
            apiKey
        });
        return response;
    }
}
exports.UserInfo = UserInfo;
exports.default = UserInfo;
//# sourceMappingURL=info.js.map