import type APIClient from "../../../client";
/**
 * UserSubCancel
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserSubCancel
 * @typedef {UserSubCancel}
 */
export declare class UserSubCancel {
    private readonly apiClient;
    /**
     * Creates an instance of UserSubCancel.
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
     * Cancel a subscription.
     * @date 2/10/2024 - 2:21:56 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<void>;
}
export default UserSubCancel;
