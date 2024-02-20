"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsRequestsAccept = void 0;
/**
 * ContactsRequestsAccept
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsRequestsAccept
 * @typedef {ContactsRequestsAccept}
 */
class ContactsRequestsAccept {
    /**
     * Creates an instance of ContactsRequestsAccept.
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
     * Accept a contact request.
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
            endpoint: "/v3/contacts/requests/accept",
            data: {
                uuid
            }
        });
    }
}
exports.ContactsRequestsAccept = ContactsRequestsAccept;
exports.default = ContactsRequestsAccept;
//# sourceMappingURL=accept.js.map