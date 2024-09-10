import type APIClient from "../../client";
import type { FileEncryptionVersion } from "../../../types";
export type DirDownloadFile = {
    uuid: string;
    bucket: string;
    region: string;
    name?: string;
    size?: string;
    mime?: string;
    chunks: number;
    parent: string;
    metadata: string;
    version: FileEncryptionVersion;
    chunksSize?: number;
    timestamp?: number;
};
export type DirDownloadFolder = {
    uuid: string;
    name: string;
    parent: string | "base";
    timestamp?: number;
};
export type DirDownloadResponse = {
    files: DirDownloadFile[];
    folders: DirDownloadFolder[];
};
export type DirDownloadType = "normal" | "shared" | "linked";
/**
 * DirDownload
 * @date 2/1/2024 - 6:04:48 PM
 *
 * @export
 * @class DirDownload
 * @typedef {DirDownload}
 */
export declare class DirDownload {
    private readonly apiClient;
    /**
     * Creates an instance of DirDownload.
     * @date 2/1/2024 - 6:04:54 PM
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
     * Download directory contents recursively in one call. Supports normal, shared and linked directories.
     * @date 2/22/2024 - 1:45:11 AM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		type?: DirDownloadType
     * 		linkUUID?: string
     * 		linkHasPassword?: boolean
     * 		linkPassword?: string
     * 		linkSalt?: string
     * 		skipCache?: boolean
     * 	}} param0
     * @param {string} param0.uuid
     * @param {DirDownloadType} [param0.type="normal"]
     * @param {string} param0.linkUUID
     * @param {boolean} param0.linkHasPassword
     * @param {string} param0.linkPassword
     * @param {string} param0.linkSalt
     * @param {boolean} param0.skipCache
     * @returns {Promise<DirDownloadResponse>}
     */
    fetch({ uuid, type, linkUUID, linkHasPassword, linkPassword, linkSalt, skipCache }: {
        uuid: string;
        type?: DirDownloadType;
        linkUUID?: string;
        linkHasPassword?: boolean;
        linkPassword?: string;
        linkSalt?: string;
        skipCache?: boolean;
    }): Promise<DirDownloadResponse>;
}
export default DirDownload;
