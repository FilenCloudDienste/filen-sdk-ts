"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirContent = void 0;
/**
 * DirContent
 * @date 2/1/2024 - 3:22:32 AM
 *
 * @export
 * @class DirContent
 * @typedef {DirContent}
 */
class DirContent {
    /**
     * Creates an instance of DirContent.
     * @date 2/1/2024 - 3:19:31 PM
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
     * Returns all files and folders inside a folder.
     * Use "recents" as the UUID parameter to get the recently uploaded files.
     * @date 2/1/2024 - 4:42:23 PM
     *
     * @public
     * @async
     * @param {({ uuid: string | "recents"; dirsOnly?: boolean })} param0
     * @param {string} param0.uuid
     * @param {boolean} [param0.dirsOnly=false]
     * @returns {Promise<DirContentResponse>}
     */
    async fetch({ uuid, dirsOnly = false }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/dir/content",
            data: Object.assign({ uuid }, (dirsOnly ? { foldersOnly: true } : {}))
        });
        return response;
    }
}
exports.DirContent = DirContent;
exports.default = DirContent;
//# sourceMappingURL=content.js.map