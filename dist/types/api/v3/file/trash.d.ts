import type APIClient from "../../client";
/**
 * FileTrash
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileTrash
 * @typedef {FileTrash}
 */
export declare class FileTrash {
    private readonly apiClient;
    /**
     * Creates an instance of FileTrash.
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
     * Move a file to the trash bin.
     * @date 2/9/2024 - 4:59:21 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<DirPresentResponse>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<void>;
}
export default FileTrash;
