/**
 * UserAffiliatePayout
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserAffiliatePayout
 * @typedef {UserAffiliatePayout}
 */
export class UserAffiliatePayout {
    apiClient;
    /**
     * Creates an instance of UserAffiliatePayout.
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
    async fetch({ address, method }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/affiliate/payout",
            data: {
                method,
                address
            }
        });
    }
}
export default UserAffiliatePayout;
//# sourceMappingURL=payout.js.map