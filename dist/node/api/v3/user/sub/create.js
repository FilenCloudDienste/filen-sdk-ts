"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSubCreate = void 0;
/**
 * UserSubCreate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserSubCreate
 * @typedef {UserSubCreate}
 */
class UserSubCreate {
    /**
     * Creates an instance of UserSubCreate.
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
     * Create a subscription payment flow.
     * @date 2/10/2024 - 2:26:46 AM
     *
     * @public
     * @async
     * @param {{ planId: number, method: PaymentMethods }} param0
     * @param {number} param0.planId
     * @param {PaymentMethods} param0.method
     * @returns {Promise<UserSubCreateResponse>}
     */
    async fetch({ planId, method }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/sub/create",
            data: {
                planId,
                method: method
            }
        });
        return response;
    }
}
exports.UserSubCreate = UserSubCreate;
exports.default = UserSubCreate;
//# sourceMappingURL=create.js.map