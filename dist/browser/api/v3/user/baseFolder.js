/**
 * UserBaseFolder
 * @date 2/1/2024 - 3:26:27 PM
 *
 * @export
 * @class UserBaseFolder
 * @typedef {UserBaseFolder}
 */
export class UserBaseFolder {
    apiClient;
    /**
     * Creates an instance of UserBaseFolder.
     * @date 2/1/2024 - 3:26:33 PM
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
     * Fetch the user's base folder information.
     * @date 2/1/2024 - 3:26:36 PM
     *
     * @public
     * @async
     * @returns {Promise<UserBaseFolderResponse>}
     */
    async fetch({ apiKey }) {
        const response = await this.apiClient.request({
            method: "GET",
            endpoint: "/v3/user/baseFolder",
            apiKey
        });
        return response;
    }
}
export default UserBaseFolder;
//# sourceMappingURL=baseFolder.js.map