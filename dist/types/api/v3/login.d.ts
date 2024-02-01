import type APIClient from "../client";
import type { AuthVersion } from "../../types";
export type LoginResponse = {
    apiKey: string;
    masterKeys: string;
    publicKey: string;
    privateKey: string;
};
/**
 * Login
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class Login
 * @typedef {Login}
 */
export declare class Login {
    private readonly apiClient;
    /**
     * Creates an instance of Login.
     * @date 2/1/2024 - 3:19:15 PM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }: {
        apiClient: APIClient;
    });
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
    fetch({ email, password, twoFactorCode, authVersion }: {
        email: string;
        password: string;
        twoFactorCode?: string;
        authVersion: AuthVersion;
    }): Promise<LoginResponse>;
}
export default Login;
