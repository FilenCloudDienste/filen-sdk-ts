"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileMove = void 0;
/**
 * FileMove
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileMove
 * @typedef {FileMove}
 */
class FileMove {
    /**
     * Creates an instance of FileMove.
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
     * Move a file.
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
            endpoint: "/v3/file/move",
            data: {
                uuid,
                to
            }
        });
    }
}
exports.FileMove = FileMove;
exports.default = FileMove;
//# sourceMappingURL=move.js.map