/// <reference types="node" />
import type APIClient from "../../client";
/**
 * UserAvatar
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserAvatar
 * @typedef {UserAvatar}
 */
export declare class UserAvatar {
    private readonly apiClient;
    /**
     * Creates an instance of UserAvatar.
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
     * Upload an avatar.
     * @date 2/10/2024 - 1:36:56 AM
     *
     * @public
     * @async
     * @param {{ buffer: Buffer }} param0
     * @param {Buffer} param0.buffer
     * @returns {Promise<void>}
     */
    fetch({ buffer }: {
        buffer: Buffer;
    }): Promise<void>;
}
export default UserAvatar;
