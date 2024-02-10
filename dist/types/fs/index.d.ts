import type API from "../api";
import type Crypto from "../crypto";
import type { FilenSDKConfig } from "..";
import type { FolderMetadata, FileMetadata } from "../types";
export type FSConfig = {
    sdkConfig: FilenSDKConfig;
    api: API;
    crypto: Crypto;
};
export type FSItemType = "file" | "directory";
export type FSItemBase = {
    uuid: string;
};
export type FSItem = (FSItemBase & {
    type: "directory";
    metadata: FolderMetadata & {
        timestamp: number;
    };
}) | (FSItemBase & {
    type: "file";
    metadata: FileMetadata & {
        timestamp: number;
    };
});
export type FSItems = Record<string, FSItem>;
export type FSStats = {
    size: number;
    mtimeMs: number;
    birthtimeMs: number;
    isDirectory: () => boolean;
    isFile: () => boolean;
};
/**
 * FS
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class FS
 * @typedef {FS}
 */
export declare class FS {
    private readonly api;
    private readonly crypto;
    private readonly sdkConfig;
    private _items;
    /**
     * Creates an instance of FS.
     * @date 2/9/2024 - 5:54:11 AM
     *
     * @constructor
     * @public
     * @param {FSConfig} params
     */
    constructor(params: FSConfig);
    private pathToDirectoryUUID;
    /**
     * List files and folders at path.
     * @date 2/9/2024 - 6:05:44 AM
     *
     * @public
     * @async
     * @param {{ path: string }} param0
     * @param {string} param0.path
     * @returns {Promise<string[]>}
     */
    readdir({ path }: {
        path: string;
    }): Promise<string[]>;
    stat({ path }: {
        path: string;
    }): Promise<FSStats>;
}
export default FS;
