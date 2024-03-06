"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirMove = void 0;
/**
 * DirMove
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirMove
 * @typedef {DirMove}
 */
class DirMove {
    /**
     * Creates an instance of DirMove.
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
     * Move a directory.
     * @date 2/9/2024 - 5:06:42 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, to: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.to
     * @returns {Promise<void>}
     */
    async fetch({ uuid, to }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/dir/move",
            data: {
                uuid,
                to
            }
        });
    }
}
exports.DirMove = DirMove;
exports.default = DirMove;
//# sourceMappingURL=move.js.map