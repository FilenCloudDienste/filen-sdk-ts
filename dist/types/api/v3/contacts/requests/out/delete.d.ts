import type APIClient from "../../../../client";
/**
 * ContactsRequestsOutDelete
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsRequestsOutDelete
 * @typedef {ContactsRequestsOutDelete}
 */
export declare class ContactsRequestsOutDelete {
    private readonly apiClient;
    /**
     * Creates an instance of ContactsRequestsOutDelete.
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
     * Delete an outgoing contact request.
     * @date 2/13/2024 - 6:02:09 AM
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
export default ContactsRequestsOutDelete;
