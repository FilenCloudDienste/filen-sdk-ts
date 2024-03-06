"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirLinked = void 0;
/**
 * DirLinked
 * @date 2/1/2024 - 8:21:05 PM
 *
 * @export
 * @class DirLinked
 * @typedef {DirLinked}
 */
class DirLinked {
    /**
     * Creates an instance of DirLinked.
     * @date 2/1/2024 - 8:21:11 PM
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
     * Returns public link information about a directory.
     * @date 2/1/2024 - 8:21:37 PM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<DirLinkedResponse>}
     */
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/dir/linked",
            data: {
                uuid
            }
        });
        return response;
    }
}
exports.DirLinked = DirLinked;
exports.default = DirLinked;
//# sourceMappingURL=linked.js.map