/**
 * ContactsRequestsSend
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsRequestsSend
 * @typedef {ContactsRequestsSend}
 */
export class ContactsRequestsSend {
    apiClient;
    /**
     * Creates an instance of ContactsRequestsSend.
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
     * Send a contact request.
     * @date 2/13/2024 - 6:03:33 AM
     *
     * @public
     * @async
     * @param {{ email: string }} param0
     * @param {string} param0.email
     * @returns {Promise<void>}
     */
    async fetch({ email }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/contacts/requests/send",
            data: {
                email
            }
        });
    }
}
export default ContactsRequestsSend;
//# sourceMappingURL=send.js.map