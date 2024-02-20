"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Health = void 0;
/**
 * Health
 * @date 2/1/2024 - 3:23:04 AM
 *
 * @export
 * @class Health
 * @typedef {Health}
 */
class Health {
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
exports.Health = Health;
exports.default = Health;
//# sourceMappingURL=index.js.map