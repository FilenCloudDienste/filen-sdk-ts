"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLinkPassword = void 0;
/**
 * FileLinkPassword
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileLinkPassword
 * @typedef {FileLinkPassword}
 */
class FileLinkPassword {
    /**
     * Creates an instance of FileLinkPassword.
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
     * Check if a file public link is password protected.
     * @date 2/10/2024 - 2:15:06 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; }} param0
     * @param {string} param0.uuid
     * @returns {Promise<FileLinkPasswordResponse>}
     */
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/file/link/password",
            data: {
                uuid
            }
        });
        return response;
    }
}
exports.FileLinkPassword = FileLinkPassword;
exports.default = FileLinkPassword;
//# sourceMappingURL=password.js.map