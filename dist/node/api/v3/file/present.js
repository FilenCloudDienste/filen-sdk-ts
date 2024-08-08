"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilePresent = void 0;
/**
 * FilePresent
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FilePresent
 * @typedef {FilePresent}
 */
class FilePresent {
    /**
     * Creates an instance of FilePresent.
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
     * Check if a file is present.
     * @date 2/9/2024 - 4:59:21 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<FilePresentResponse>}
     */
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/file/present",
            data: {
                uuid
            }
        });
        return response;
    }
}
exports.FilePresent = FilePresent;
exports.default = FilePresent;
//# sourceMappingURL=present.js.map