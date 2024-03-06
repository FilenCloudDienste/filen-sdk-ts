/**
 * AuthInfo
 * @date 2/1/2024 - 3:23:04 AM
 *
 * @export
 * @class AuthInfo
 * @typedef {AuthInfo}
 */
export class AuthInfo {
    apiClient;
    /**
     * Creates an instance of AuthInfo.
     * @date 2/1/2024 - 3:19:19 PM
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
     * Returns authentication info.
     * @date 2/1/2024 - 3:23:14 AM
     *
     * @public
     * @async
     * @returns {Promise<AuthInfoResponse>}
     */
    async fetch({ email }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/auth/info",
            data: {
                email
            }
        });
        return response;
    }
}
export default AuthInfo;
//# sourceMappingURL=info.js.map