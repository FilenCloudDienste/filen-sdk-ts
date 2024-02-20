"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contacts = void 0;
/**
 * Contacts
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class Contacts
 * @typedef {Contacts}
 */
class Contacts {
    /**
     * Creates an instance of Contacts.
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
     * Fetch all contacts.
     * @date 2/13/2024 - 5:54:05 AM
     *
     * @public
     * @async
     * @returns {Promise<ContactsResponse>}
     */
    async fetch() {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/contacts"
        });
        return response;
    }
}
exports.Contacts = Contacts;
exports.default = Contacts;
//# sourceMappingURL=contacts.js.map