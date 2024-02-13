import type APIClient from "../../../client";
/**
 * ContactsBlockedAdd
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ContactsBlockedAdd
 * @typedef {ContactsBlockedAdd}
 */
export declare class ContactsBlockedAdd {
    private readonly apiClient;
    /**
     * Creates an instance of ContactsBlockedAdd.
     * @date 2/1/2024 - 8:16:39 PM
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
     * Block a contact or a user.
     * @date 2/13/2024 - 6:14:38 AM
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
export default ContactsBlockedAdd;
