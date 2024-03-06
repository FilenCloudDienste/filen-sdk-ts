/**
 * UserSettingsPasswordChange
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserSettingsPasswordChange
 * @typedef {UserSettingsPasswordChange}
 */
export class UserSettingsPasswordChange {
    apiClient;
    /**
     * Creates an instance of UserSettingsPasswordChange.
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
     * Change password. Requires derived hashed current && new password. Master keys are in encrypted form.
     * @date 2/10/2024 - 1:56:33 AM
     *
     * @public
     * @async
     * @param {{
     *         password: string
     *         currentPassword: string
     *         authVersion: AuthVersion
     *         salt: string
     *         masterKeys: string
     *     }} param0
     * @param {string} param0.password
     * @param {string} param0.currentPassword
     * @param {AuthVersion} param0.authVersion
     * @param {string} param0.salt
     * @param {string} param0.masterKeys
     * @returns {Promise<UserSettingsPasswordChangeResponse>}
     */
    async fetch({ password, currentPassword, authVersion, salt, masterKeys }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/settings/password/change",
            data: {
                password,
                currentPassword,
                authVersion,
                salt,
                masterKeys
            }
        });
        return response;
    }
}
export default UserSettingsPasswordChange;
//# sourceMappingURL=change.js.map