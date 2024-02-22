"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirDownload = void 0;
const utils_1 = require("../../../crypto/utils");
/**
 * DirDownload
 * @date 2/1/2024 - 6:04:48 PM
 *
 * @export
 * @class DirDownload
 * @typedef {DirDownload}
 */
class DirDownload {
    /**
     * Creates an instance of DirDownload.
     * @date 2/1/2024 - 6:04:54 PM
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
     * Download directory contents recursively in one call. Supports normal, shared and linked directories.
     * @date 2/22/2024 - 1:45:11 AM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		type?: DirDownloadType
     * 		linkUUID?: string
     * 		linkHasPassword?: boolean
     * 		linkPassword?: string
     * 		linkSalt?: string
     * 		skipCache?: boolean
     * 	}} param0
     * @param {string} param0.uuid
     * @param {DirDownloadType} [param0.type="normal"]
     * @param {string} param0.linkUUID
     * @param {boolean} param0.linkHasPassword
     * @param {string} param0.linkPassword
     * @param {string} param0.linkSalt
     * @param {boolean} param0.skipCache
     * @returns {Promise<DirDownloadResponse>}
     */
    async fetch({ uuid, type = "normal", linkUUID, linkHasPassword, linkPassword, linkSalt, skipCache }) {
        const endpoint = type === "shared" ? "/v3/dir/download/shared" : type === "linked" ? "/v3/dir/download/link" : "/v3/dir/download";
        const data = type === "shared" || type === "normal"
            ? Object.assign({ uuid }, (skipCache ? { skipCache } : {})) : Object.assign({ uuid: linkUUID, parent: uuid, password: linkHasPassword && linkSalt && linkPassword
                ? linkSalt.length === 32
                    ? await (0, utils_1.deriveKeyFromPassword)({
                        password: linkPassword,
                        salt: linkSalt,
                        iterations: 200000,
                        hash: "sha512",
                        bitLength: 512,
                        returnHex: true
                    })
                    : await (0, utils_1.hashFn)({ input: linkPassword.length === 0 ? "empty" : linkPassword })
                : await (0, utils_1.hashFn)({ input: "empty" }) }, (skipCache ? { skipCache } : {}));
        const response = await this.apiClient.request({
            method: "POST",
            endpoint,
            data
        });
        return response;
    }
}
exports.DirDownload = DirDownload;
exports.default = DirDownload;
//# sourceMappingURL=download.js.map