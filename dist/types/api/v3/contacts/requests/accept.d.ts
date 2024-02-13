import type APIClient from "../../../client";
/**
 * ContactsRequestsAccept
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsRequestsAccept
 * @typedef {ContactsRequestsAccept}
 */
export declare class ContactsRequestsAccept {
    private readonly apiClient;
    /**
     * Creates an instance of ContactsRequestsAccept.
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
     * Accept a contact request.
     * @date 2/13/2024 - 6:04:55 AM
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
export default ContactsRequestsAccept;
