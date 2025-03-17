/**
 * UploadEmpty
 * @date 2/1/2024 - 4:45:26 PM
 *
 * @export
 * @class UploadEmpty
 * @typedef {UploadEmpty}
 */
export class UploadEmpty {
    apiClient;
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
export default UploadEmpty;
//# sourceMappingURL=empty.js.map