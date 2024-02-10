import type APIClient from "../../../client";
export type User2FAEnableResponse = {
    recoveryKeys: string;
};
/**
 * User2FAEnable
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class User2FAEnable
 * @typedef {User2FAEnable}
 */
export declare class User2FAEnable {
    private readonly apiClient;
    /**
     * Creates an instance of User2FAEnable.
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
     * Enable 2FA.
     * @date 2/10/2024 - 1:59:21 AM
     *
     * @public
     * @async
     * @param {{
     * 		code: string
     * 	}} param0
     * @param {string} param0.code
     * @returns {Promise<User2FAEnableResponse>}
     */
    fetch({ code }: {
        code: string;
    }): Promise<User2FAEnableResponse>;
}
export default User2FAEnable;
