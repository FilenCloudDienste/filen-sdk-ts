"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserGetDEK = void 0;
/**
 * UserGetDEK
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserGetDEK
 * @typedef {UserGetDEK}
 */
class UserGetDEK {
    /**
     * Creates an instance of UserGetDEK.
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
    async fetch(params) {
        return await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/user/dek",
            apiKey: params === null || params === void 0 ? void 0 : params.apiKey
        });
    }
}
exports.UserGetDEK = UserGetDEK;
exports.default = UserGetDEK;
//# sourceMappingURL=getDEK.js.map