"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserGDPR = void 0;
/**
 * UserGDPR
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserGDPR
 * @typedef {UserGDPR}
 */
class UserGDPR {
    /**
     * Creates an instance of UserGDPR.
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
     * Get the user's GDPR info.
     * @date 2/10/2024 - 1:23:53 AM
     *
     * @public
     * @async
     * @returns {Promise<UserGDPRResponse>}
     */
    async fetch() {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/user/gdpr"
        });
        return response;
    }
}
exports.UserGDPR = UserGDPR;
exports.default = UserGDPR;
//# sourceMappingURL=gdpr.js.map