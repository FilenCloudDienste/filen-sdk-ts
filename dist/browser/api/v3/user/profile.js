/**
 * UserProfile
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserProfile
 * @typedef {UserProfile}
 */
export class UserProfile {
    apiClient;
    /**
     * Creates an instance of UserProfile.
     * @date 2/1/2024 - 8:16:39 PM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }) {
        this.apiClient = apiClient;
    }
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
    async fetch({ id }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/profile",
            data: {
                id
            }
        });
        return response;
    }
}
export default UserProfile;
//# sourceMappingURL=profile.js.map