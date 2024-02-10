import type APIClient from "../../../client";
/**
 * FileVersionRestore
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileVersionRestore
 * @typedef {FileVersionRestore}
 */
export declare class FileVersionRestore {
    private readonly apiClient;
    /**
     * Creates an instance of FileVersionRestore.
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
     * Restore an old file version.
     * @date 2/9/2024 - 7:19:29 PM
     *
     * @public
     * @async
     * @param {{ uuid: string; currentUUID: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.currentUUID
     * @returns {Promise<void>}
     */
    fetch({ uuid, currentUUID }: {
        uuid: string;
        currentUUID: string;
    }): Promise<void>;
}
export default FileVersionRestore;
