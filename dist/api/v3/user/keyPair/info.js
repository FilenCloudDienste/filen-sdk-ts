"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserKeyPairInfo = void 0;
/**
 * UserKeyPairInfo
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserKeyPairInfo
 * @typedef {UserKeyPairInfo}
 */
class UserKeyPairInfo {
    /**
     * Creates an instance of UserKeyPairInfo.
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
     * Get keypair info.
     * @date 2/20/2024 - 7:42:40 AM
     *
     * @public
     * @async
     * @param {{
     * 		apiKey?: string
     * 	}} param0
     * @param {string} [param0.apiKey=undefined]
     * @returns {Promise<UserKeyPairInfoResponse>}
     */
    async fetch({ apiKey = undefined }) {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/user/keyPair/info",
            apiKey
        });
        return response;
    }
}
exports.UserKeyPairInfo = UserKeyPairInfo;
exports.default = UserKeyPairInfo;
//# sourceMappingURL=info.js.map