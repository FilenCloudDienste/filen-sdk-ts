import type APIClient from "../../../client";
import type { DirColors } from "../color";
import { type FileMetadata, type FolderMetadata } from "../../../../types";
export type DirLinkContentResponse = {
    folders: {
        color: DirColors | null;
        metadata: string;
        parent: string;
        timestamp: number;
        uuid: string;
    }[];
    files: {
        bucket: string;
        chunks: number;
        metadata: string;
        parent: string;
        region: string;
        size: number;
        timestamp: number;
        uuid: string;
        version: number;
    }[];
};
export type DirLinkContentDecryptedResponse = {
    folders: {
        color: DirColors | null;
        metadata: FolderMetadata;
        parent: string;
        timestamp: number;
        uuid: string;
    }[];
    files: {
        bucket: string;
        chunks: number;
        metadata: FileMetadata;
        parent: string;
        region: string;
        size: number;
        timestamp: number;
        uuid: string;
        version: number;
    }[];
};
/**
 * DirLinkContent
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirLinkContent
 * @typedef {DirLinkContent}
 */
export declare class DirLinkContent {
    private readonly apiClient;
    /**
     * Creates an instance of DirLinkContent.
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
     * Get contents of a directory public link.
     * @date 2/10/2024 - 2:20:01 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, password: string, parent: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.password
     * @param {string} param0.parent
     * @returns {Promise<DirLinkContentResponse>}
     */
    fetch({ uuid, password, parent }: {
        uuid: string;
        password: string;
        parent: string;
    }): Promise<DirLinkContentResponse>;
}
export default DirLinkContent;
