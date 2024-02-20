"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsRequestsIn = void 0;
/**
 * ContactsRequestsIn
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsRequestsIn
 * @typedef {ContactsRequestsIn}
 */
class ContactsRequestsIn {
    /**
     * Creates an instance of ContactsRequestsIn.
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
     * Fetch all incoming contact requests.
     * @date 2/13/2024 - 5:56:16 AM
     *
     * @public
     * @async
     * @returns {Promise<ContactsRequestsInResponse>}
     */
    async fetch() {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/contacts/requests/in"
        });
        return response;
    }
}
exports.ContactsRequestsIn = ContactsRequestsIn;
exports.default = ContactsRequestsIn;
//# sourceMappingURL=in.js.map