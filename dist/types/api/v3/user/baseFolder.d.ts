import type APIClient from "../../client";
export type UserBaseFolderResponse = {
    uuid: string;
};
/**
 * UserBaseFolder
 * @date 2/1/2024 - 3:26:27 PM
 *
 * @export
 * @class UserBaseFolder
 * @typedef {UserBaseFolder}
 */
export declare class UserBaseFolder {
    private readonly apiClient;
    /**
     * Creates an instance of UserBaseFolder.
     * @date 2/1/2024 - 3:26:33 PM
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
     * Fetch the user's base folder information.
     * @date 2/1/2024 - 3:26:36 PM
     *
     * @public
     * @async
     * @returns {Promise<UserBaseFolderResponse>}
     */
    fetch({ apiKey }: {
        apiKey?: string;
    }): Promise<UserBaseFolderResponse>;
}
export default UserBaseFolder;
