import type APIClient from "../../client";
/**
 * UserSetDEK
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserSetDEK
 * @typedef {UserSetDEK}
 */
export declare class UserSetDEK {
    private readonly apiClient;
    /**
     * Creates an instance of UserSetDEK.
     * @date 2/14/2024 - 4:40:52 AM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient; }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }: {
        apiClient: APIClient;
    });
    fetch({ encryptedDEK, apiKey }: {
        encryptedDEK: string;
        apiKey?: string;
    }): Promise<void>;
}
export default UserSetDEK;
