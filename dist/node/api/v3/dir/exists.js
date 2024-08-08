"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirExists = void 0;
/**
 * DirExists
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirExists
 * @typedef {DirExists}
 */
class DirExists {
    /**
     * Creates an instance of DirExists.
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
     * Check if a directory already exists.
     * @date 2/9/2024 - 4:44:34 AM
     *
     * @public
     * @async
     * @param {{
     *         nameHashed: string
     *         parent: string
     *     }} param0
     * @param {string} param0.nameHashed
     * @param {string} param0.parent
     * @returns {Promise<DirExistsResponse>}
     */
    async fetch({ nameHashed, parent }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/dir/exists",
            data: {
                parent,
                nameHashed
            }
        });
        return response;
    }
}
exports.DirExists = DirExists;
exports.default = DirExists;
//# sourceMappingURL=exists.js.map