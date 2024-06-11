/**
 * UserDidExportMasterKeys
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserDidExportMasterKeys
 * @typedef {UserDidExportMasterKeys}
 */
export class UserDidExportMasterKeys {
    apiClient;
    /**
     * Creates an instance of UserDidExportMasterKeys.
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
     * Set current master keys as exported.
     * @date 2/10/2024 - 1:50:50 AM
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    async fetch() {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/didExportMasterKeys",
            data: {}
        });
    }
}
export default UserDidExportMasterKeys;
//# sourceMappingURL=didExportMasterKeys.js.map