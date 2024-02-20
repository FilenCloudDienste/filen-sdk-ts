"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRename = void 0;
/**
 * FileRename
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileRename
 * @typedef {FileRename}
 */
class FileRename {
    /**
     * Creates an instance of FileRename.
     * @date 2/14/2024 - 4:40:52 AM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient; }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }) {
        this.apiClient = apiClient;
    }
    /**
     * Rename a file.
     * @date 2/14/2024 - 4:40:39 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; metadataEncrypted: string; nameEncrypted: string, nameHashed: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.metadataEncrypted
     * @param {string} param0.nameEncrypted
     * @param {string} param0.nameHashed
     * @returns {Promise<void>}
     */
    async fetch({ uuid, metadataEncrypted, nameEncrypted, nameHashed }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/file/rename",
            data: {
                uuid,
                name: nameEncrypted,
                nameHashed,
                metadata: metadataEncrypted
            }
        });
    }
}
exports.FileRename = FileRename;
exports.default = FileRename;
//# sourceMappingURL=rename.js.map