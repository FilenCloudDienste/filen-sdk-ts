import type APIClient from "../../../client";
/**
 * UserKeyPairSet
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserKeyPairSet
 * @typedef {UserKeyPairSet}
 */
export declare class UserKeyPairSet {
    private readonly apiClient;
    /**
     * Creates an instance of UserKeyPairSet.
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
     * Set keypair.
     * @date 2/20/2024 - 7:41:01 AM
     *
     * @public
     * @async
     * @param {{ publicKey: string, encryptedPrivateKey: string, apiKey?: string }} param0
     * @param {string} param0.publicKey
     * @param {string} param0.encryptedPrivateKey
     * @param {string} param0.apiKey
     * @returns {Promise<void>}
     */
    fetch({ publicKey, encryptedPrivateKey, apiKey }: {
        publicKey: string;
        encryptedPrivateKey: string;
        apiKey?: string;
    }): Promise<void>;
}
export default UserKeyPairSet;
