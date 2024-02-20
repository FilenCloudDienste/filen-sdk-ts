"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirCreate = void 0;
const utils_1 = require("../../../utils");
/**
 * DirCreate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirCreate
 * @typedef {DirCreate}
 */
class DirCreate {
    /**
     * Creates an instance of DirCreate.
     * @date 2/14/2024 - 4:35:07 AM
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
     * Create a new folder.
     * @date 2/14/2024 - 4:35:02 AM
     *
     * @public
     * @async
     * @param {{ uuid?: string; metadataEncrypted: string; parent: string, nameHashed: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.metadataEncrypted
     * @param {string} param0.parent
     * @param {string} param0.nameHashed
     * @returns {Promise<DirCreateResponse>}
     */
    async fetch({ uuid, metadataEncrypted, parent, nameHashed }) {
        const uuidToUse = uuid ? uuid : await (0, utils_1.uuidv4)();
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/dir/create",
            data: {
                uuid: uuidToUse,
                name: metadataEncrypted,
                nameHashed,
                parent
            }
        });
        return response;
    }
}
exports.DirCreate = DirCreate;
exports.default = DirCreate;
//# sourceMappingURL=create.js.map