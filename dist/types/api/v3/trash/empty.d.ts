import type APIClient from "../../client";
/**
 * TrashEmpty
 * @date 2/9/2024 - 5:39:37 AM
 *
 * @export
 * @class TrashEmpty
 * @typedef {TrashEmpty}
 */
export declare class TrashEmpty {
    private readonly apiClient;
    /**
     * Creates an instance of TrashEmpty.
     * @date 2/9/2024 - 5:39:43 AM
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
     * Empty the trash bin.
     * @date 2/9/2024 - 5:41:49 AM
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    fetch(): Promise<void>;
}
export default TrashEmpty;
