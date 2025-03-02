import type APIClient from "../../client";
export type UserGetDEKResponse = {
    dek: string | null;
};
/**
 * UserGetDEK
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserGetDEK
 * @typedef {UserGetDEK}
 */
export declare class UserGetDEK {
    private readonly apiClient;
    /**
     * Creates an instance of UserGetDEK.
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
    fetch(params?: {
        apiKey?: string;
    }): Promise<UserGetDEKResponse>;
}
export default UserGetDEK;
