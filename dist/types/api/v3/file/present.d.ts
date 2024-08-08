import type APIClient from "../../client";
export type FilePresentResponse = {
    present: boolean;
    versioned: boolean;
    trash: boolean;
};
/**
 * FilePresent
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FilePresent
 * @typedef {FilePresent}
 */
export declare class FilePresent {
    private readonly apiClient;
    /**
     * Creates an instance of FilePresent.
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
     * Check if a file is present.
     * @date 2/9/2024 - 4:59:21 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<FilePresentResponse>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<FilePresentResponse>;
}
export default FilePresent;
