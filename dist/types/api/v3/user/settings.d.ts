import type APIClient from "../../client";
export type UserSettingsResponse = {
    email: string;
    storageUsed: number;
    twoFactorEnabled: 0 | 1;
    twoFactorKey: string;
    unfinishedFiles: number;
    unfinishedStorage: number;
    versionedFiles: number;
    versionedStorage: number;
    versioningEnabled: boolean;
    loginAlertsEnabled: boolean;
};
/**
 * UserSettings
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserSettings
 * @typedef {UserSettings}
 */
export declare class UserSettings {
    private readonly apiClient;
    /**
     * Creates an instance of UserSettings.
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
     * Get the user's settings/info.
     * @date 2/10/2024 - 1:23:53 AM
     *
     * @public
     * @async
     * @returns {Promise<UserSettingsResponse>}
     */
    fetch(): Promise<UserSettingsResponse>;
}
export default UserSettings;
