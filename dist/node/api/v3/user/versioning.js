"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserVersioning = void 0;
/**
 * UserVersioning
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserVersioning
 * @typedef {UserVersioning}
 */
class UserVersioning {
    /**
     * Creates an instance of UserVersioning.
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
     * Toggle file versioning.
     * @date 2/10/2024 - 2:31:30 AM
     *
     * @public
     * @async
     * @param {{ enable: boolean }} param0
     * @param {boolean} param0.enable
     * @returns {Promise<void>}
     */
    async fetch({ enable }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/versioning",
            data: {
                enabled: enable ? 1 : 0
            }
        });
    }
}
exports.UserVersioning = UserVersioning;
exports.default = UserVersioning;
//# sourceMappingURL=versioning.js.map