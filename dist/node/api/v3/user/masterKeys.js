"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMasterKeys = void 0;
/**
 * UserMasterKeys
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserMasterKeys
 * @typedef {UserMasterKeys}
 */
class UserMasterKeys {
    /**
     * Creates an instance of UserMasterKeys.
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
     * Update master keys.
     * @date 2/20/2024 - 7:43:35 AM
     *
     * @public
     * @async
     * @param {{
     * 		encryptedMasterKeys: string
     * 		apiKey?: string
     * 	}} param0
     * @param {string} param0.encryptedMasterKeys
     * @param {string} param0.apiKey
     * @returns {Promise<UserMasterKeysResponse>}
     */
    async fetch({ encryptedMasterKeys, apiKey }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/masterKeys",
            data: {
                masterKeys: encryptedMasterKeys
            },
            apiKey
        });
        return response;
    }
}
exports.UserMasterKeys = UserMasterKeys;
exports.default = UserMasterKeys;
//# sourceMappingURL=masterKeys.js.map