"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileGet = void 0;
/**
 * FileGet
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileGet
 * @typedef {FileGet}
 */
class FileGet {
    /**
     * Creates an instance of FileGet.
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
     * Get file info.
     *
     * @public
     * @async
     * @param {{ uuid: string; }} param0
     * @param {string} param0.uuid
     * @returns {Promise<FileGetResponse>}
     */
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/file",
            data: {
                uuid
            }
        });
        return response;
    }
}
exports.FileGet = FileGet;
exports.default = FileGet;
//# sourceMappingURL=get.js.map