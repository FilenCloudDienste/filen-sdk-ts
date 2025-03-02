"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSetDEK = void 0;
/**
 * UserSetDEK
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserSetDEK
 * @typedef {UserSetDEK}
 */
class UserSetDEK {
    /**
     * Creates an instance of UserSetDEK.
     * @date 2/14/2024 - 4:40:52 AM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient; }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }) {
        this.apiClient = apiClient;
    }
    async fetch({ encryptedDEK, apiKey }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/dek",
            apiKey,
            data: {
                dek: encryptedDEK
            }
        });
    }
}
exports.UserSetDEK = UserSetDEK;
exports.default = UserSetDEK;
//# sourceMappingURL=setDEK.js.map