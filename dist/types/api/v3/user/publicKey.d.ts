import type APIClient from "../../client";
export type UserPublicKeyResponse = {
    publicKey: string;
};
/**
 * UserPublicKey
 * @date 2/1/2024 - 3:18:55 PM
 *
 * @export
 * @class UserPublicKey
 * @typedef {UserPublicKey}
 */
export declare class UserPublicKey {
    private readonly apiClient;
    /**
     * Creates an instance of UserPublicKey.
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
     * Get a user's public key.
     * @date 2/9/2024 - 7:22:21 PM
     *
     * @public
     * @async
     * @param {{email:string}} param0
     * @param {string} param0.email
     * @returns {Promise<UserPublicKeyResponse>}
     */
    fetch({ email }: {
        email: string;
    }): Promise<UserPublicKeyResponse>;
}
export default UserPublicKey;
