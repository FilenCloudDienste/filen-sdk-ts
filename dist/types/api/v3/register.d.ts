import type APIClient from "../client";
import type { AuthVersion } from "../../types";
/**
 * Register
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class Register
 * @typedef {Register}
 */
export declare class Register {
    private readonly apiClient;
    /**
     * Creates an instance of Register.
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
    fetch({ email, password, salt, authVersion }: {
        email: string;
        password: string;
        salt: string;
        authVersion: AuthVersion;
    }): Promise<void>;
}
export default Register;
