import type APIClient from "../../client";
/**
 * UserDidExportMasterKeys
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserDidExportMasterKeys
 * @typedef {UserDidExportMasterKeys}
 */
export declare class UserDidExportMasterKeys {
    private readonly apiClient;
    /**
     * Creates an instance of UserDidExportMasterKeys.
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
     * Set current master keys as exported.
     * @date 2/10/2024 - 1:50:50 AM
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    fetch(): Promise<void>;
}
export default UserDidExportMasterKeys;
