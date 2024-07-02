/**
 * UserLock
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserLock
 * @typedef {UserInvoice}
 */
export class UserLock {
    apiClient;
    /**
     * Creates an instance of UserLock.
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
     * Lock/unlock/refresh/status a resource.
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		resource: string
     * 		type: "acquire" | "refresh" | "status" | "release"
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.resource
     * @param {("acquire" | "refresh" | "status" | "release")} param0.type
     * @returns {Promise<UserLockResponse>}
     */
    async fetch({ uuid, resource, type }) {
        return await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/lock",
            data: {
                uuid,
                type,
                resource
            }
        });
    }
}
export default UserLock;
//# sourceMappingURL=lock.js.map