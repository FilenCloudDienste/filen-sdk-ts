import type APIClient from "../../../client";
/**
 * ContactsRequestsSend
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsRequestsSend
 * @typedef {ContactsRequestsSend}
 */
export declare class ContactsRequestsSend {
    private readonly apiClient;
    /**
     * Creates an instance of ContactsRequestsSend.
     * @date 2/1/2024 - 3:19:15 PM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }: {
        apiClient: APIClient;
    });
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
    fetch({ email }: {
        email: string;
    }): Promise<void>;
}
export default ContactsRequestsSend;
