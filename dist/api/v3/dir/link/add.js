"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirLinkAdd = void 0;
/**
 * DirLinkAdd
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirLinkAdd
 * @typedef {DirLinkAdd}
 */
class DirLinkAdd {
    /**
     * Creates an instance of DirLinkAdd.
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
     * Add an item to a public linked folder.
     * @date 2/9/2024 - 4:24:27 AM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		parent: string
     * 		linkUUID: string
     * 		type: string
     * 		metadata: string
     * 		key: string
     * 		expiration: string
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.parent
     * @param {string} param0.linkUUID
     * @param {string} param0.type
     * @param {string} param0.metadata
     * @param {string} param0.key
     * @param {string} param0.expiration
     * @returns {Promise<void>}
     */
    async fetch({ uuid, parent, linkUUID, type, metadata, key, expiration }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/dir/link/add",
            data: {
                uuid,
                parent,
                linkUUID,
                type,
                metadata,
                key,
                expiration
            }
        });
    }
}
exports.DirLinkAdd = DirLinkAdd;
exports.default = DirLinkAdd;
//# sourceMappingURL=add.js.map