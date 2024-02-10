import type APIClient from "../../../../client";
/**
 * ItemSharedOutRemove
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ItemSharedOutRemove
 * @typedef {ItemSharedOutRemove}
 */
export declare class ItemSharedOutRemove {
    private readonly apiClient;
    /**
     * Creates an instance of ItemSharedOutRemove.
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
     * Remove an item that you are sharing.
     * @date 2/9/2024 - 7:48:27 PM
     *
     * @public
     * @async
     * @param {{ uuid: string; receiverId: number; }} param0
     * @param {string} param0.uuid
     * @param {number} param0.receiverId
     * @returns {Promise<void>}
     */
    fetch({ uuid, receiverId }: {
        uuid: string;
        receiverId: number;
    }): Promise<void>;
}
export default ItemSharedOutRemove;
