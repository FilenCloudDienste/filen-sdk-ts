import type APIClient from "../../client";
export type UserLockStatus = "locked";
export type UserLockResponse = {
    acquired: boolean;
    released: boolean;
    refreshed: boolean;
    resource: string;
    status: UserLockStatus;
};
/**
 * UserLock
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserLock
 * @typedef {UserInvoice}
 */
export declare class UserLock {
    private readonly apiClient;
    /**
     * Creates an instance of UserLock.
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
     * Lock/unlock/refresh/status a resource.
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		resource: string
     * 		type: "acquire" | "refresh" | "status" | "release"
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.resource
     * @param {("acquire" | "refresh" | "status" | "release")} param0.type
     * @returns {Promise<UserLockResponse>}
     */
    fetch({ uuid, resource, type }: {
        uuid: string;
        resource: string;
        type: "acquire" | "refresh" | "status" | "release";
    }): Promise<UserLockResponse>;
}
export default UserLock;
