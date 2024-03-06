/**
 * ContactsBlockedDelete
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ContactsBlockedDelete
 * @typedef {ContactsBlockedDelete}
 */
export class ContactsBlockedDelete {
    apiClient;
    /**
     * Creates an instance of ContactsBlockedDelete.
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
     * Unblock a contact.
     * @date 2/13/2024 - 6:16:03 AM
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
            endpoint: "/v3/contacts/blocked/delete",
            data: {
                uuid
            }
        });
    }
}
export default ContactsBlockedDelete;
//# sourceMappingURL=delete.js.map