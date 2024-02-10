import type APIClient from "../../client";
export type ItemSharedUser = {
    id: number;
    email: string;
    publicKey: string;
};
export type ItemSharedResponse = {
    sharing: boolean;
    users: ItemSharedUser[];
};
/**
 * ItemShared
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ItemShared
 * @typedef {ItemShared}
 */
export declare class ItemShared {
    private readonly apiClient;
    /**
     * Creates an instance of ItemShared.
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
     * Get sharing information about an item.
     * @date 2/9/2024 - 4:30:58 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<ItemSharedResponse>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<ItemSharedResponse>;
}
export default ItemShared;
