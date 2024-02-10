import type APIClient from "../../../client";
/**
 * ItemLinkedRename
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ItemLinkedRename
 * @typedef {ItemLinkedRename}
 */
export declare class ItemLinkedRename {
    private readonly apiClient;
    /**
     * Creates an instance of ItemLinkedRename.
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
     * Rename a public linked item
     * @date 2/9/2024 - 4:37:35 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; linkUUID: string; metadata: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.linkUUID
     * @param {string} param0.metadata
     * @returns {Promise<void>}
     */
    fetch({ uuid, linkUUID, metadata }: {
        uuid: string;
        linkUUID: string;
        metadata: string;
    }): Promise<void>;
}
export default ItemLinkedRename;
