/**
 * FileDeletePermanent
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileDeletePermanent
 * @typedef {FileDeletePermanent}
 */
export class FileDeletePermanent {
    apiClient;
    /**
     * Creates an instance of FileDeletePermanent.
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
     * Delete a file permanently.
     * @date 2/9/2024 - 7:13:10 PM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    async fetch({ uuid }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/file/delete/permanent",
            data: {
                uuid
            }
        });
    }
}
export default FileDeletePermanent;
//# sourceMappingURL=permanent.js.map