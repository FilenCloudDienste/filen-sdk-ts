import type APIClient from "../../../client";
/**
 * ItemSharedRename
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ItemSharedRename
 * @typedef {ItemSharedRename}
 */
export declare class ItemSharedRename {
    private readonly apiClient;
    /**
     * Creates an instance of ItemSharedRename.
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
     * Rename a shared item.
     * @date 2/9/2024 - 4:39:59 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; receiverId: number; metadata: string }} param0
     * @param {string} param0.uuid
     * @param {number} param0.receiverId
     * @param {string} param0.metadata
     * @returns {Promise<void>}
     */
    fetch({ uuid, receiverId, metadata }: {
        uuid: string;
        receiverId: number;
        metadata: string;
    }): Promise<void>;
}
export default ItemSharedRename;
