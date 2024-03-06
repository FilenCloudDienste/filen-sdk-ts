"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadDone = void 0;
/**
 * UploadDone
 * @date 2/1/2024 - 4:45:26 PM
 *
 * @export
 * @class UploadDone
 * @typedef {UploadDone}
 */
class UploadDone {
    /**
     * Creates an instance of UploadDone.
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
    /**
     * Mark an upload as done.
     * @date 2/1/2024 - 4:45:36 PM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		name: string
     * 		nameHashed: string
     * 		size: string
     * 		chunks: number
     * 		mime: string
     * 		rm: string
     * 		metadata: string
     * 		version: FileEncryptionVersion
     * 		uploadKey: string
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.name
     * @param {string} param0.nameHashed
     * @param {string} param0.size
     * @param {number} param0.chunks
     * @param {string} param0.mime
     * @param {string} param0.rm
     * @param {string} param0.metadata
     * @param {FileEncryptionVersion} param0.version
     * @param {string} param0.uploadKey
     * @returns {Promise<UploadDoneResponse>}
     */
    async fetch({ uuid, name, nameHashed, size, chunks, mime, rm, metadata, version, uploadKey }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/upload/done",
            data: {
                uuid,
                name,
                nameHashed,
                size,
                chunks,
                mime,
                rm,
                metadata,
                version,
                uploadKey
            }
        });
        return response;
    }
}
exports.UploadDone = UploadDone;
exports.default = UploadDone;
//# sourceMappingURL=done.js.map