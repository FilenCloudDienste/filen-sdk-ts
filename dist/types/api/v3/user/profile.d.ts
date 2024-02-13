import type APIClient from "../../client";
export type UserProfileResponse = {
    id: number;
    email: string;
    publicKey: string;
    avatar: string;
    appearOffline: boolean;
    lastActive: number;
    nickName: string;
    createdAt: number;
};
/**
 * UserProfile
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserProfile
 * @typedef {UserProfile}
 */
export declare class UserProfile {
    private readonly apiClient;
    /**
     * Creates an instance of UserProfile.
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
     * Fetch a user's public profile.
     * @date 2/13/2024 - 6:42:31 AM
     *
     * @public
     * @async
     * @param {{ id: number }} param0
     * @param {number} param0.id
     * @returns {Promise<UserProfileResponse>}
     */
    fetch({ id }: {
        id: number;
    }): Promise<UserProfileResponse>;
}
export default UserProfile;
