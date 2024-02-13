import type APIClient from "../../../client";
/**
 * UserLastActiveDesktop
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserLastActiveDesktop
 * @typedef {UserLastActiveDesktop}
 */
export declare class UserLastActiveDesktop {
    private readonly apiClient;
    /**
     * Creates an instance of UserLastActiveDesktop.
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
     * Update last active timestamp for the desktop platform.
     * @date 2/13/2024 - 6:44:14 AM
     *
     * @public
     * @async
     * @param {{ timestamp: number }} param0
     * @param {number} param0.timestamp
     * @returns {Promise<void>}
     */
    fetch({ timestamp }: {
        timestamp: number;
    }): Promise<void>;
}
export default UserLastActiveDesktop;
