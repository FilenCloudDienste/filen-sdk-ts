import type APIClient from "../../../client";
export type FileLinkStatusResponse = {
    uuid: string | null;
    enabled: boolean;
    expiration: number | null;
    expirationText: string | null;
    downloadBtn: 0 | 1;
    password: string | null;
};
/**
 * FileLinkStatus
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileLinkStatus
 * @typedef {FileLinkStatus}
 */
export declare class FileLinkStatus {
    private readonly apiClient;
    /**
     * Creates an instance of FileLinkStatus.
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
     * Get public link status of a file.
     * @date 2/10/2024 - 12:46:07 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<FileLinkStatusResponse>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<FileLinkStatusResponse>;
}
export default FileLinkStatus;
