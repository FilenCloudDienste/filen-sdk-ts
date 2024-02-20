"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = void 0;
/**
 * Login
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class Login
 * @typedef {Login}
 */
class Login {
    /**
     * Creates an instance of Login.
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
     * Login. Send "XXXXXX" as the twoFactorCode when 2FA is disabled.
     * @date 2/1/2024 - 3:10:59 PM
     *
     * @public
     * @async
     * @param {{ email: string, password: string, twoFactorCode: string, authVersion: AuthVersion }} param0
     * @param {string} param0.email
     * @param {string} param0.password
     * @param {string} param0.twoFactorCode
     * @param {AuthVersion} param0.authVersion
     * @returns {Promise<LoginResponse>}
     */
    async fetch({ email, password, twoFactorCode = "XXXXXX", authVersion }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/login",
            data: {
                email,
                password,
                twoFactorCode,
                authVersion
            }
        });
        return response;
    }
}
exports.Login = Login;
exports.default = Login;
//# sourceMappingURL=login.js.map