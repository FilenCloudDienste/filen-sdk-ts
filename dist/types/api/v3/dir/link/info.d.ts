import type APIClient from "../../../client";
import { type FolderMetadata } from "../../../../types";
export type DirLinkInfoResponse = {
    parent: string;
    metadata: string;
    hasPassword: boolean;
    salt: string;
    timestamp: number;
};
export type DirLinkInfoDecryptedResponse = {
    parent: string;
    metadata: FolderMetadata;
    hasPassword: boolean;
    salt: string;
    timestamp: number;
};
/**
 * DirLinkInfo
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirLinkInfo
 * @typedef {DirLinkInfo}
 */
export declare class DirLinkInfo {
    private readonly apiClient;
    /**
     * Creates an instance of DirLinkInfo.
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
     * Get public link info of a directory.
     * @date 2/10/2024 - 12:46:07 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<DirLinkInfoResponse>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<DirLinkInfoResponse>;
}
export default DirLinkInfo;
