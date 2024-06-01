/**
 * Register
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class Register
 * @typedef {Register}
 */
export class Register {
    apiClient;
    /**
     * Creates an instance of Register.
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
     * Create an account.
     *
     * @public
     * @async
     * @param {{
     * 		email: string
     * 		password: string
     * 		salt: string
     * 		authVersion: AuthVersion
     * 	}} param0
     * @param {string} param0.email
     * @param {string} param0.password
     * @param {string} param0.salt
     * @param {AuthVersion} param0.authVersion
     * @returns {Promise<void>}
     */
    async fetch({ email, password, salt, authVersion }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/register",
            data: {
                email,
                password,
                salt,
                authVersion
            }
        });
    }
}
export default Register;
//# sourceMappingURL=register.js.map