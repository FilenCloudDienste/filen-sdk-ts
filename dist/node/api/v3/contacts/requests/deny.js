"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsRequestsDeny = void 0;
/**
 * ContactsRequestsDeny
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsRequestsDeny
 * @typedef {ContactsRequestsDeny}
 */
class ContactsRequestsDeny {
    /**
     * Creates an instance of ContactsRequestsDeny.
     * @date 2/1/2024 - 3:19:15 PM
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
     * Deny a contact request.
     * @date 2/13/2024 - 6:04:55 AM
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
            endpoint: "/v3/contacts/requests/deny",
            data: {
                uuid
            }
        });
    }
}
exports.ContactsRequestsDeny = ContactsRequestsDeny;
exports.default = ContactsRequestsDeny;
//# sourceMappingURL=deny.js.map