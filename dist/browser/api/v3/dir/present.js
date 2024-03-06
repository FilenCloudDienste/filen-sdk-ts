/**
 * DirPresent
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirPresent
 * @typedef {DirPresent}
 */
export class DirPresent {
    apiClient;
    /**
     * Creates an instance of DirPresent.
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
     * Check if a directory is present.
     * @date 2/9/2024 - 4:59:21 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<DirPresentResponse>}
     */
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/dir/present",
            data: {
                uuid
            }
        });
        return response;
    }
}
export default DirPresent;
//# sourceMappingURL=present.js.map