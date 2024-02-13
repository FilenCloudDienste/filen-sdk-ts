import type APIClient from "../../client";
/**
 * UserAppearOffline
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserAppearOffline
 * @typedef {UserAppearOffline}
 */
export declare class UserAppearOffline {
    private readonly apiClient;
    /**
     * Creates an instance of UserAppearOffline.
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
     * Toggle appear offline status.
     * @date 2/13/2024 - 6:10:56 AM
     *
     * @public
     * @async
     * @param {{ appearOffline: boolean }} param0
     * @param {boolean} param0.appearOffline
     * @returns {Promise<void>}
     */
    fetch({ appearOffline }: {
        appearOffline: boolean;
    }): Promise<void>;
}
export default UserAppearOffline;
