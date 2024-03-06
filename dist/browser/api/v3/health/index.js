/**
 * Health
 * @date 2/1/2024 - 3:23:04 AM
 *
 * @export
 * @class Health
 * @typedef {Health}
 */
export class Health {
    apiClient;
    /**
     * Creates an instance of Health.
     * @date 2/1/2024 - 3:19:24 PM
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
     * Returns "OK" when API is healthy.
     * @date 2/1/2024 - 3:23:14 AM
     *
     * @public
     * @async
     * @returns {Promise<"OK">}
     */
    async fetch() {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/health"
        });
        return response;
    }
}
export default Health;
//# sourceMappingURL=index.js.map