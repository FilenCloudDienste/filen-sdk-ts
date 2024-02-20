"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsRequestsOut = void 0;
/**
 * ContactsRequestsOut
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsRequestsOut
 * @typedef {ContactsRequestsOut}
 */
class ContactsRequestsOut {
    /**
     * Creates an instance of ContactsRequestsOut.
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
     * Fetch all outgoing contact requests.
     * @date 2/13/2024 - 6:00:33 AM
     *
     * @public
     * @async
     * @returns {Promise<ContactsRequestsOutResponse>}
     */
    async fetch() {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/contacts/requests/in"
        });
        return response;
    }
}
exports.ContactsRequestsOut = ContactsRequestsOut;
exports.default = ContactsRequestsOut;
//# sourceMappingURL=out.js.map