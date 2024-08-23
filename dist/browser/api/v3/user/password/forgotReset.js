/**
 * UserPasswordForgotReset
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class UserPasswordForgotReset
 * @typedef {UserPasswordForgotReset}
 */
export class UserPasswordForgotReset {
    apiClient;
    /**
     * Creates an instance of UserPasswordForgotReset.
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
     * Reset password.
     *
     * @public
     * @async
     * @param {{
     * 		token: string
     * 		password: string
     * 		authVersion: number
     * 		salt: string
     * 		hasRecoveryKeys: boolean
     * 		newMasterKeys: string
     * 	}} param0
     * @param {string} param0.token
     * @param {string} param0.password
     * @param {number} param0.authVersion
     * @param {string} param0.salt
     * @param {boolean} param0.hasRecoveryKeys
     * @param {string} param0.newMasterKeys
     * @returns {Promise<void>}
     */
    async fetch({ token, password, authVersion, salt, hasRecoveryKeys, newMasterKeys }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/password/forgot/reset",
            data: {
                token,
                password,
                authVersion,
                salt,
                hasRecoveryKeys,
                newMasterKeys
            }
        });
    }
}
export default UserPasswordForgotReset;
//# sourceMappingURL=forgotReset.js.map