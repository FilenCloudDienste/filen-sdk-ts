import type APIClient from "../../../../client";
/**
 * ItemSharedInRemove
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ItemSharedInRemove
 * @typedef {ItemSharedInRemove}
 */
export declare class ItemSharedInRemove {
    private readonly apiClient;
    /**
     * Creates an instance of ItemSharedInRemove.
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
     * Remove an item that has been shared with you.
     * @date 2/9/2024 - 7:49:19 PM
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
export default ItemSharedInRemove;
