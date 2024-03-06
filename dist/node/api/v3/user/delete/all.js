"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDeleteAll = void 0;
/**
 * UserDeleteAll
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserDeleteAll
 * @typedef {UserDeleteAll}
 */
class UserDeleteAll {
    /**
     * Creates an instance of UserDeleteAll.
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
     * Delete all files and directories.
     * @date 2/10/2024 - 1:50:50 AM
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    async fetch() {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/delete/all",
            data: {}
        });
    }
}
exports.UserDeleteAll = UserDeleteAll;
exports.default = UserDeleteAll;
//# sourceMappingURL=all.js.map