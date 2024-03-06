"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInvoice = void 0;
/**
 * UserInvoice
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserInvoice
 * @typedef {UserInvoice}
 */
class UserInvoice {
    /**
     * Creates an instance of UserInvoice.
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
     * Generate an invoice PDF (Base64 encoded).
     * @date 2/10/2024 - 2:24:05 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<string>}
     */
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/invoice",
            data: {
                uuid
            }
        });
        return response;
    }
}
exports.UserInvoice = UserInvoice;
exports.default = UserInvoice;
//# sourceMappingURL=invoice.js.map