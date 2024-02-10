import type APIClient from "../../../client";
/**
 * DirLinkRemove
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirLinkRemove
 * @typedef {DirLinkRemove}
 */
export declare class DirLinkRemove {
    private readonly apiClient;
    /**
     * Creates an instance of DirLinkRemove.
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
     * Remove a directory public link.
     * @date 2/10/2024 - 1:10:50 AM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 	}} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<void>;
}
export default DirLinkRemove;
