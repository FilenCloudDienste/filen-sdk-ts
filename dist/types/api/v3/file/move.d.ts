import type APIClient from "../../client";
/**
 * FileMove
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileMove
 * @typedef {FileMove}
 */
export declare class FileMove {
    private readonly apiClient;
    /**
     * Creates an instance of FileMove.
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
     * Move a file.
     * @date 2/9/2024 - 5:06:42 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, to: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.to
     * @returns {Promise<void>}
     */
    fetch({ uuid, to }: {
        uuid: string;
        to: string;
    }): Promise<void>;
}
export default FileMove;
