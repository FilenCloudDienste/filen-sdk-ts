import type APIClient from "../../../client";
/**
 * UserPasswordForgot
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class UserPasswordForgot
 * @typedef {UserPasswordForgot}
 */
export declare class UserPasswordForgot {
    private readonly apiClient;
    /**
     * Creates an instance of UserPasswordForgot.
     * @date 2/1/2024 - 3:19:15 PM
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
     * Send password reset instruction email.
     *
     * @public
     * @async
     * @param {{
     * 		email: string
     * 	}} param0
     * @param {string} param0.email
     * @returns {Promise<void>}
     */
    fetch({ email }: {
        email: string;
    }): Promise<void>;
}
export default UserPasswordForgot;
