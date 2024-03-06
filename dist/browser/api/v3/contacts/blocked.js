/**
 * ContactsBlocked
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsBlocked
 * @typedef {ContactsBlocked}
 */
export class ContactsBlocked {
    apiClient;
    /**
     * Creates an instance of ContactsBlocked.
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
     * Fetch all blocked contacts.
     * @date 2/13/2024 - 5:56:16 AM
     *
     * @public
     * @async
     * @returns {Promise<ContactsBlockedResponse>}
     */
    async fetch() {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/contacts/blocked"
        });
        return response;
    }
}
export default ContactsBlocked;
//# sourceMappingURL=blocked.js.map