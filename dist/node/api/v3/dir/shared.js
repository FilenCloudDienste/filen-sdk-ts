"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirShared = void 0;
/**
 * DirShared
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirShared
 * @typedef {DirShared}
 */
class DirShared {
    /**
     * Creates an instance of DirShared.
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
     * Returns sharing information about a directory.
     * @date 2/1/2024 - 8:16:46 PM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 	}} param0
     * @param {string} param0.uuid
     * @returns {Promise<DirSharedResponse>}
     */
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/dir/shared",
            data: {
                uuid
            }
        });
        return response;
    }
}
exports.DirShared = DirShared;
exports.default = DirShared;
//# sourceMappingURL=shared.js.map