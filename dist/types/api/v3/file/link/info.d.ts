import type APIClient from "../../../client";
import type { FileEncryptionVersion } from "../../../../types";
export type FileLinkInfoResponse = {
    bucket: string;
    chunks: number;
    downloadBtn: boolean;
    mime: string;
    name: string;
    password: string | null;
    region: string;
    size: string;
    timestamp: number;
    uuid: string;
    version: FileEncryptionVersion;
};
/**
 * FileLinkInfo
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileLinkInfo
 * @typedef {FileLinkInfo}
 */
export declare class FileLinkInfo {
    private readonly apiClient;
    /**
     * Creates an instance of FileLinkInfo.
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
     * Get file public link info.
     * @date 2/10/2024 - 2:13:05 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, password: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.password
     * @returns {Promise<FileLinkInfoResponse>}
     */
    fetch({ uuid, password }: {
        uuid: string;
        password: string;
    }): Promise<FileLinkInfoResponse>;
}
export default FileLinkInfo;
