import type APIClient from "../../client";
/**
 * FileRestore
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileRestore
 * @typedef {FileRestore}
 */
export declare class FileRestore {
    private readonly apiClient;
    /**
     * Creates an instance of FileRestore.
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
     * Restore a file from the trash bin.
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
export default FileRestore;
