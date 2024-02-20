import type APIClient from "../../../client";
export type UserKeyPairInfoResponse = {
    publicKey: string;
    privateKey: string;
};
/**
 * UserKeyPairInfo
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserKeyPairInfo
 * @typedef {UserKeyPairInfo}
 */
export declare class UserKeyPairInfo {
    private readonly apiClient;
    /**
     * Creates an instance of UserKeyPairInfo.
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
     * Get keypair info.
     * @date 2/20/2024 - 7:42:40 AM
     *
     * @public
     * @async
     * @param {{
     * 		apiKey?: string
     * 	}} param0
     * @param {string} [param0.apiKey=undefined]
     * @returns {Promise<UserKeyPairInfoResponse>}
     */
    fetch({ apiKey }: {
        apiKey?: string;
    }): Promise<UserKeyPairInfoResponse>;
}
export default UserKeyPairInfo;
