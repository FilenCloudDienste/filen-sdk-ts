import type APIClient from "../../client";
import type { FileEncryptionVersion } from "../../../types";
export type DirContentUpload = {
    uuid: string;
    metadata: string;
    rm: string;
    timestamp: number;
    chunks: number;
    size: number;
    bucket: string;
    region: string;
    parent: string;
    version: FileEncryptionVersion;
    favorited: 0 | 1;
};
export type DirContentFolder = {
    uuid: string;
    name: string;
    parent: string;
    color: string | null;
    timestamp: number;
    favorited: 0 | 1;
    is_sync: 0 | 1;
    is_default: 0 | 1;
};
export type DirContentResponse = {
    uploads: DirContentUpload[];
    folders: DirContentFolder[];
};
/**
 * DirContent
 * @date 2/1/2024 - 3:22:32 AM
 *
 * @export
 * @class DirContent
 * @typedef {DirContent}
 */
export declare class DirContent {
    private readonly apiClient;
    constructor({ apiClient }: {
        apiClient: APIClient;
    });
    /**
     * Returns all files and folders inside a folder.
     * @date 2/1/2024 - 3:22:42 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<DirContentResponse>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<DirContentResponse>;
}
export default DirContent;
