"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirMetadata = void 0;
/**
 * DirMetadata
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirMetadata
 * @typedef {DirMetadata}
 */
class DirMetadata {
    /**
     * Creates an instance of DirMetadata.
     * @date 2/14/2024 - 4:41:14 AM
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
     * Change metadata of a directory.
     * @date 2/14/2024 - 4:41:08 AM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		metadataEncrypted: string
     * 		nameHashed: string
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.metadataEncrypted
     * @param {string} param0.nameHashed
     * @returns {Promise<void>}
     */
    async fetch({ uuid, metadataEncrypted, nameHashed }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/dir/metadata",
            data: {
                uuid,
                name: metadataEncrypted,
                nameHashed
            }
        });
    }
}
exports.DirMetadata = DirMetadata;
exports.default = DirMetadata;
//# sourceMappingURL=metadata.js.map