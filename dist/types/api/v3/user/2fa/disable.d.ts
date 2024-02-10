import type APIClient from "../../../client";
/**
 * User2FADisable
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class User2FADisable
 * @typedef {User2FADisable}
 */
export declare class User2FADisable {
    private readonly apiClient;
    /**
     * Creates an instance of User2FADisable.
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
     * Disable 2FA.
     * @date 2/10/2024 - 1:59:21 AM
     *
     * @public
     * @async
     * @param {{
     * 		code: string
     * 	}} param0
     * @param {string} param0.code
     * @returns {Promise<void>}
     */
    fetch({ code }: {
        code: string;
    }): Promise<void>;
}
export default User2FADisable;
