import type APIClient from "../../client";
/**
 * UserInvoice
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserInvoice
 * @typedef {UserInvoice}
 */
export declare class UserInvoice {
    private readonly apiClient;
    /**
     * Creates an instance of UserInvoice.
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
     * Generate an invoice PDF (Base64 encoded).
     * @date 2/10/2024 - 2:24:05 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<string>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<string>;
}
export default UserInvoice;
