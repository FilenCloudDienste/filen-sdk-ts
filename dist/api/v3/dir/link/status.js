"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirLinkStatus = void 0;
/**
 * DirLinkStatus
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirLinkStatus
 * @typedef {DirLinkStatus}
 */
class DirLinkStatus {
    /**
     * Creates an instance of DirLinkStatus.
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
     * Get public link status of a directory.
     * @date 2/10/2024 - 12:46:07 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<DirLinkStatusResponse>}
     */
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/dir/link/status",
            data: {
                uuid
            }
        });
        return response;
    }
}
exports.DirLinkStatus = DirLinkStatus;
exports.default = DirLinkStatus;
//# sourceMappingURL=status.js.map