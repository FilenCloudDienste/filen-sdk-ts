"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadEmpty = void 0;
/**
 * UploadEmpty
 * @date 2/1/2024 - 4:45:26 PM
 *
 * @export
 * @class UploadEmpty
 * @typedef {UploadEmpty}
 */
class UploadEmpty {
    /**
     * Creates an instance of UploadEmpty.
     * @date 2/1/2024 - 4:45:31 PM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }) {
        this.apiClient = apiClient;
    }
    async fetch({ uuid, name, nameHashed, size, parent, mime, metadata, version }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/upload/empty",
            data: {
                uuid,
                name,
                nameHashed,
                size,
                parent,
                mime,
                metadata,
                version
            }
        });
        return response;
    }
}
exports.UploadEmpty = UploadEmpty;
exports.default = UploadEmpty;
//# sourceMappingURL=empty.js.map