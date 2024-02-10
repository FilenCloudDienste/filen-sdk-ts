import type APIClient from "../../client";
export type ItemLinkedLink = {
    linkUUID: string;
    linkKey: string;
};
export type ItemLinkedResponse = {
    link: boolean;
    links: ItemLinkedLink[];
};
/**
 * ItemLinked
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ItemLinked
 * @typedef {ItemLinked}
 */
export declare class ItemLinked {
    private readonly apiClient;
    /**
     * Creates an instance of ItemLinked.
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
     * Get public link information about an item.
     * @date 2/9/2024 - 4:30:58 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<ItemLinkedResponse>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<ItemLinkedResponse>;
}
export default ItemLinked;
