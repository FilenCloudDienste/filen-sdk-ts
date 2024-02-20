import type APIClient from "../../client";
export type UserInfoResponse = {
    id: number;
    email: string;
    isPremium: 0 | 1;
    maxStorage: number;
    storageUsed: number;
    avatarURL: string;
    baseFolderUUID: string;
};
/**
 * UserInfo
 * @date 2/1/2024 - 3:18:55 PM
 *
 * @export
 * @class UserInfo
 * @typedef {UserInfo}
 */
export declare class UserInfo {
    private readonly apiClient;
    /**
     * Creates an instance of UserInfo.
     * @date 2/1/2024 - 3:19:01 PM
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
     * Fetch user info.
     * @date 2/1/2024 - 3:19:04 PM
     *
     * @public
     * @async
     * @returns {Promise<UserInfoResponse>}
     */
    fetch({ apiKey }: {
        apiKey?: string;
    }): Promise<UserInfoResponse>;
}
export default UserInfo;
