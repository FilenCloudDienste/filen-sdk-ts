/**
 * UserPasswordForgot
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class UserPasswordForgot
 * @typedef {UserPasswordForgot}
 */
export class UserPasswordForgot {
    apiClient;
    /**
     * Creates an instance of UserPasswordForgot.
     * @date 2/1/2024 - 3:19:15 PM
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
     * Send password reset instruction email.
     *
     * @public
     * @async
     * @param {{
     * 		email: string
     * 	}} param0
     * @param {string} param0.email
     * @returns {Promise<void>}
     */
    async fetch({ email }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/password/forgot",
            data: {
                email
            }
        });
    }
}
export default UserPasswordForgot;
//# sourceMappingURL=forgot.js.map