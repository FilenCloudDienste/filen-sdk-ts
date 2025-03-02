/**
 * UserSetDEK
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserSetDEK
 * @typedef {UserSetDEK}
 */
export class UserSetDEK {
    apiClient;
    /**
     * Creates an instance of UserSetDEK.
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
    async fetch({ encryptedDEK, apiKey }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/dek",
            apiKey,
            data: {
                dek: encryptedDEK
            }
        });
    }
}
export default UserSetDEK;
//# sourceMappingURL=setDEK.js.map