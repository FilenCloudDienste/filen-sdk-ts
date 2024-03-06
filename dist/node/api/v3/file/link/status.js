"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLinkStatus = void 0;
/**
 * FileLinkStatus
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileLinkStatus
 * @typedef {FileLinkStatus}
 */
class FileLinkStatus {
    /**
     * Creates an instance of FileLinkStatus.
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
     * Get public link status of a file.
     * @date 2/10/2024 - 12:46:07 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<FileLinkStatusResponse>}
     */
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/file/link/status",
            data: {
                uuid
            }
        });
        return response;
    }
}
exports.FileLinkStatus = FileLinkStatus;
exports.default = FileLinkStatus;
//# sourceMappingURL=status.js.map