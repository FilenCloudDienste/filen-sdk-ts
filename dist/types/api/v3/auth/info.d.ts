import type APIClient from "../../client";
import type { AuthVersion } from "../../../types";
export type AuthInfoResponse = {
    email: string;
    authVersion: AuthVersion;
    salt: string;
    id: number;
};
/**
 * AuthInfo
 * @date 2/1/2024 - 3:23:04 AM
 *
 * @export
 * @class AuthInfo
 * @typedef {AuthInfo}
 */
export declare class AuthInfo {
    private readonly apiClient;
    /**
     * Creates an instance of AuthInfo.
     * @date 2/1/2024 - 3:19:19 PM
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
     * Returns authentication info.
     * @date 2/1/2024 - 3:23:14 AM
     *
     * @public
     * @async
     * @returns {Promise<AuthInfoResponse>}
     */
    fetch({ email }: {
        email: string;
    }): Promise<AuthInfoResponse>;
}
export default AuthInfo;
