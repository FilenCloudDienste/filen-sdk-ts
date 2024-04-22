import type APIClient from "../../client";
import type { FileEncryptionVersion } from "../../../types";
import type { DirColors } from "./color";
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
    color: DirColors;
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
    /**
     * Creates an instance of DirContent.
     * @date 2/1/2024 - 3:19:31 PM
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
     * Returns all files and folders inside a folder.
     * Use "recents" as the UUID parameter to get the recently uploaded files.
     * @date 2/1/2024 - 4:42:23 PM
     *
     * @public
     * @async
     * @param {({ uuid: string | "recents"; dirsOnly?: boolean })} param0
     * @param {string} param0.uuid
     * @param {boolean} [param0.dirsOnly=false]
     * @returns {Promise<DirContentResponse>}
     */
    fetch({ uuid, dirsOnly }: {
        uuid: string | "recents";
        dirsOnly?: boolean;
    }): Promise<DirContentResponse>;
}
export default DirContent;
