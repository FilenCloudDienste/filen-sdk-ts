"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAccount = void 0;
/**
 * UserAccount
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserAccount
 * @typedef {UserAccount}
 */
class UserAccount {
    /**
     * Creates an instance of UserAccount.
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
     * Get the user's account information.
     * @date 2/10/2024 - 1:25:53 AM
     *
     * @public
     * @async
     * @returns {Promise<UserAccountResponse>}
     */
    async fetch() {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/user/account"
        });
        return response;
    }
}
exports.UserAccount = UserAccount;
exports.default = UserAccount;
//# sourceMappingURL=account.js.map