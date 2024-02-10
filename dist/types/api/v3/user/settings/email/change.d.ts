import type APIClient from "../../../../client";
import type { AuthVersion } from "../../../../../types";
/**
 * UserSettingsEmailChange
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserSettingsEmailChange
 * @typedef {UserSettingsEmailChange}
 */
export declare class UserSettingsEmailChange {
    private readonly apiClient;
    /**
     * Creates an instance of UserSettingsEmailChange.
     * @date 2/1/2024 - 8:16:39 PM
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
     * Change the user's email. Requires derived hashed password.
     * @date 2/10/2024 - 1:40:31 AM
     *
     * @public
     * @async
     * @param {{ email: string, password: string, authVersion: AuthVersion }} param0
     * @param {string} param0.email
     * @param {string} param0.password
     * @param {AuthVersion} param0.authVersion
     * @returns {Promise<void>}
     */
    fetch({ email, password, authVersion }: {
        email: string;
        password: string;
        authVersion: AuthVersion;
    }): Promise<void>;
}
export default UserSettingsEmailChange;
