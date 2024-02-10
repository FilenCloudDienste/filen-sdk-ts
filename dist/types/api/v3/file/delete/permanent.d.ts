import type APIClient from "../../../client";
/**
 * FileDeletePermanent
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileDeletePermanent
 * @typedef {FileDeletePermanent}
 */
export declare class FileDeletePermanent {
    private readonly apiClient;
    /**
     * Creates an instance of FileDeletePermanent.
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
     * Delete a file permanently.
     * @date 2/9/2024 - 7:13:10 PM
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
export default FileDeletePermanent;
