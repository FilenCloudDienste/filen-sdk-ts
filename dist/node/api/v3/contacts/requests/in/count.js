"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsRequestsInCount = void 0;
/**
 * ContactsRequestsInCount
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsRequestsInCount
 * @typedef {ContactsRequestsInCount}
 */
class ContactsRequestsInCount {
    /**
     * Creates an instance of ContactsRequestsInCount.
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
     * Fetch count of incoming contact requests.
     * @date 2/13/2024 - 5:58:45 AM
     *
     * @public
     * @async
     * @returns {Promise<ContactsRequestsInCountResponse>}
     */
    async fetch() {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/contacts/requests/in/count"
        });
        return response;
    }
}
exports.ContactsRequestsInCount = ContactsRequestsInCount;
exports.default = ContactsRequestsInCount;
//# sourceMappingURL=count.js.map