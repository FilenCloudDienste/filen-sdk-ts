import type APIClient from "../../../client";
/**
 * UserAffiliatePayout
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserAffiliatePayout
 * @typedef {UserAffiliatePayout}
 */
export declare class UserAffiliatePayout {
    private readonly apiClient;
    /**
     * Creates an instance of UserAffiliatePayout.
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
     * Request an affiliate payout.
     * @date 2/10/2024 - 2:28:58 AM
     *
     * @public
     * @async
     * @param {{ address: string; method: string }} param0
     * @param {string} param0.address
     * @param {string} param0.method
     * @returns {Promise<void>}
     */
    fetch({ address, method }: {
        address: string;
        method: string;
    }): Promise<void>;
}
export default UserAffiliatePayout;
