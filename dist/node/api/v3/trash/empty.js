"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrashEmpty = void 0;
/**
 * TrashEmpty
 * @date 2/9/2024 - 5:39:37 AM
 *
 * @export
 * @class TrashEmpty
 * @typedef {TrashEmpty}
 */
class TrashEmpty {
    /**
     * Creates an instance of TrashEmpty.
     * @date 2/9/2024 - 5:39:43 AM
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
     * Empty the trash bin.
     * @date 2/9/2024 - 5:41:49 AM
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    async fetch() {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/trash/empty",
            data: {}
        });
    }
}
exports.TrashEmpty = TrashEmpty;
exports.default = TrashEmpty;
//# sourceMappingURL=empty.js.map