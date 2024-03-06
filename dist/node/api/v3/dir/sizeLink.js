"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirSizeLink = void 0;
/**
 * DirSizeLink
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirSizeLink
 * @typedef {DirSizeLink}
 */
class DirSizeLink {
    /**
     * Creates an instance of DirSizeLink.
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
     * Get the size of a directory inside a public link.
     * @date 2/9/2024 - 5:36:04 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; linkUUID: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.linkUUID
     * @returns {Promise<DirSizeLinkResponse>}
     */
    async fetch({ uuid, linkUUID }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/dir/size/link",
            data: {
                uuid,
                linkUUID
            }
        });
        return response;
    }
}
exports.DirSizeLink = DirSizeLink;
exports.default = DirSizeLink;
//# sourceMappingURL=sizeLink.js.map