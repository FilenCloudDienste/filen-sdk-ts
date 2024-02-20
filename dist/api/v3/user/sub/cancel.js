"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSubCancel = void 0;
/**
 * UserSubCancel
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserSubCancel
 * @typedef {UserSubCancel}
 */
class UserSubCancel {
    /**
     * Creates an instance of UserSubCancel.
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
     * Cancel a subscription.
     * @date 2/10/2024 - 2:21:56 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    async fetch({ uuid }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/sub/cancel",
            data: {
                uuid
            }
        });
    }
}
exports.UserSubCancel = UserSubCancel;
exports.default = UserSubCancel;
//# sourceMappingURL=cancel.js.map