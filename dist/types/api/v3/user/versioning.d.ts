import type APIClient from "../../client";
/**
 * UserVersioning
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserVersioning
 * @typedef {UserVersioning}
 */
export declare class UserVersioning {
    private readonly apiClient;
    /**
     * Creates an instance of UserVersioning.
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
     * Toggle file versioning.
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
export default UserVersioning;
