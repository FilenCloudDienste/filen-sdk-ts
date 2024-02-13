import type APIClient from "../../client";
/**
 * ContactsDelete
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsDelete
 * @typedef {ContactsDelete}
 */
export declare class ContactsDelete {
    private readonly apiClient;
    /**
     * Creates an instance of ContactsDelete.
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
     * Delete a contact.
     * @date 2/13/2024 - 6:07:40 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<void>;
}
export default ContactsDelete;
