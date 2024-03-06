"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNickname = void 0;
/**
 * UserNickname
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserNickname
 * @typedef {UserNickname}
 */
class UserNickname {
    /**
     * Creates an instance of UserNickname.
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
     * Change nickname.
     * @date 2/13/2024 - 6:09:23 AM
     *
     * @public
     * @async
     * @param {{ nickname: string }} param0
     * @param {string} param0.nickname
     * @returns {Promise<void>}
     */
    async fetch({ nickname }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/nickname",
            data: {
                nickname
            }
        });
    }
}
exports.UserNickname = UserNickname;
exports.default = UserNickname;
//# sourceMappingURL=nickname.js.map