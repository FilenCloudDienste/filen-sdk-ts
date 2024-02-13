import type APIClient from "../../client";
/**
 * UserNickname
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserNickname
 * @typedef {UserNickname}
 */
export declare class UserNickname {
    private readonly apiClient;
    /**
     * Creates an instance of UserNickname.
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
     * Change nickname.
     * @date 2/13/2024 - 6:09:23 AM
     *
     * @public
     * @async
     * @param {{ nickname: string }} param0
     * @param {string} param0.nickname
     * @returns {Promise<void>}
     */
    fetch({ nickname }: {
        nickname: string;
    }): Promise<void>;
}
export default UserNickname;
