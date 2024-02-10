import type APIClient from "../../client";
/**
 * UserLoginAlerts
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserLoginAlerts
 * @typedef {UserLoginAlerts}
 */
export declare class UserLoginAlerts {
    private readonly apiClient;
    /**
     * Creates an instance of UserLoginAlerts.
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
     * Toggle login alerts.
     * @date 2/10/2024 - 2:31:30 AM
     *
     * @public
     * @async
     * @param {{ enable: boolean }} param0
     * @param {boolean} param0.enable
     * @returns {Promise<void>}
     */
    fetch({ enable }: {
        enable: boolean;
    }): Promise<void>;
}
export default UserLoginAlerts;
