import type APIClient from "../../client";
/**
 * UserDelete
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserDelete
 * @typedef {UserDelete}
 */
export declare class UserDelete {
    private readonly apiClient;
    /**
     * Creates an instance of UserDelete.
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
     * Request account deletion.
     * @date 2/10/2024 - 1:49:19 AM
     *
     * @public
     * @async
     * @param {{ twoFactorCode?: string }} param0
     * @param {string} [param0.twoFactorCode="XXXXXX"]
     * @returns {Promise<void>}
     */
    fetch({ twoFactorCode }: {
        twoFactorCode?: string;
    }): Promise<void>;
}
export default UserDelete;
