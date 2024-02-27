/// <reference types="node" />
import type API from "../api";
import type { FilenSDKConfig } from "..";
import type { FolderMetadata, FileMetadata, FileEncryptionVersion, ProgressCallback } from "../types";
import type { PauseSignal } from "../cloud/signals";
import type { CloudItem, Cloud } from "../cloud";
export type FSConfig = {
    sdkConfig: FilenSDKConfig;
    api: API;
    cloud: Cloud;
};
export type FSItemType = "file" | "directory";
export type FSItemBase = {
    uuid: string;
};
export type FSItemFileBase = {
    region: string;
    bucket: string;
    version: FileEncryptionVersion;
    chunks: number;
};
export type FSItem = (FSItemBase & {
    type: "directory";
    metadata: FolderMetadata;
}) | (FSItemBase & {
    type: "file";
    metadata: FSItemFileBase & FileMetadata;
});
export type FSItems = Record<string, FSItem>;
export type FSStatsBase = {
    size: number;
    mtimeMs: number;
    birthtimeMs: number;
    isDirectory: () => boolean;
    isFile: () => boolean;
    isSymbolicLink: () => boolean;
};
export type FSStats = (FolderMetadata & FSStatsBase & {
    type: "directory";
    uuid: string;
}) | (FSItemFileBase & FileMetadata & FSStatsBase & {
    type: "file";
    uuid: string;
});
export type StatFS = {
    type: number;
    bsize: number;
    blocks: number;
    bfree: number;
    bavail: number;
    files: number;
    ffree: number;
    used: number;
    max: number;
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
    private readonly sdkConfig;
    private readonly cloud;
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
    /**
     * Add an item to the internal item tree.
     * @date 2/14/2024 - 12:50:52 AM
     *
     * @public
     * @param {{ path: string, item: FSItem }} param0
     * @param {string} param0.path
     * @param {FSItem} param0.item
     * @returns {void}
     */
    _addItem({ path, item }: {
        path: string;
        item: FSItem;
    }): void;
    /**
     * Remove an item from the internal item tree.
     * @date 2/14/2024 - 12:50:52 AM
     *
     * @public
     * @param {{ path: string }} param0
     * @param {string} param0.path
     * @returns {void}
     */
    _removeItem({ path }: {
        path: string;
    }): void;
    /**
     * Normalizes a path to be used with FS.
     * @date 2/14/2024 - 12:50:52 AM
     *
     * @private
     * @param {{ path: string }} param0
     * @param {string} param0.path
     * @returns {string}
     */
    private normalizePath;
    private pathToItemUUID;
    /**
     * List files and directories at path.
     * @date 2/20/2024 - 2:40:03 AM
     *
     * @public
     * @async
     * @param {{ path: string, recursive?: boolean }} param0
     * @param {string} param0.path
     * @param {boolean} [param0.recursive=false]
     * @returns {Promise<string[]>}
     */
    readdir({ path, recursive }: {
        path: string;
        recursive?: boolean;
    }): Promise<string[]>;
    /**
     * Alias of readdir.
     * @date 2/13/2024 - 8:48:40 PM
     *
     * @public
     * @async
     * @param {...Parameters<typeof this.readdir>} params
     * @returns {ReturnType<typeof this.readdir>}
     */
    ls(...params: Parameters<typeof this.readdir>): ReturnType<typeof this.readdir>;
    stat({ path }: {
        path: string;
    }): Promise<FSStats>;
    /**
     * Alias of stat.
     * @date 2/13/2024 - 8:49:18 PM
     *
     * @public
     * @async
     * @param {...Parameters<typeof this.stat>} params
     * @returns {ReturnType<typeof this.stat>}
     */
    lstat(...params: Parameters<typeof this.stat>): ReturnType<typeof this.stat>;
    /**
     * Creates a directory at path. Recursively creates intermediate directories if they don't exist.
     * @date 2/14/2024 - 1:34:11 AM
     *
     * @public
     * @async
     * @param {{ path: string }} param0
     * @param {string} param0.path
     * @returns {Promise<void>}
     */
    mkdir({ path }: {
        path: string;
    }): Promise<void>;
    /**
     * Rename or move a file/directory. Recursively creates intermediate directories if needed.
     * @date 2/14/2024 - 1:39:32 AM
     *
     * @public
     * @async
     * @param {{ from: string; to: string }} param0
     * @param {string} param0.from
     * @param {string} param0.to
     * @returns {Promise<void>}
     */
    rename({ from, to }: {
        from: string;
        to: string;
    }): Promise<void>;
    /**
     * Returns filesystem information.
     * @date 2/14/2024 - 2:13:19 AM
     *
     * @public
     * @async
     * @returns {Promise<StatFS>}
     */
    statfs(): Promise<StatFS>;
    /**
     * Deletes file/directoy at path (Sends it to the trash).
     * @date 2/14/2024 - 2:16:42 AM
     *
     * @private
     * @async
     * @param {{ path: string }} param0
     * @param {string} param0.path
     * @returns {Promise<void>}
     */
    private _unlink;
    /**
     * Deletes file/directory at path (Sends it to the trash).
     * @date 2/14/2024 - 2:55:28 AM
     *
     * @public
     * @async
     * @param {{path: string}} param0
     * @param {string} param0.path
     * @returns {ReturnType<typeof this._unlink>}
     */
    unlink({ path }: {
        path: string;
    }): ReturnType<typeof this._unlink>;
    /**
     * Alias of unlink.
     * @date 2/14/2024 - 2:55:33 AM
     *
     * @public
     * @async
     * @param {{path: string}} param0
     * @param {string} param0.path
     * @returns {ReturnType<typeof this._unlink>}
     */
    rm({ path }: {
        path: string;
    }): ReturnType<typeof this._unlink>;
    /**
     * Deletes directory at path (Sends it to the trash).
     * @date 2/14/2024 - 2:53:48 AM
     *
     * @public
     * @async
     * @param {...Parameters<typeof this.unlink>} params
     * @returns {ReturnType<typeof this.unlink>}
     */
    rmdir(...params: Parameters<typeof this.unlink>): ReturnType<typeof this.unlink>;
    /**
     * Read a file. Returns buffer of given length, at position and offset. Memory efficient to read only a small part of a file.
     * @date 2/20/2024 - 9:44:16 PM
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		offset: number
     * 		length: number
     * 		position: number
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 	}} param0
     * @param {string} param0.path
     * @param {number} param0.offset
     * @param {number} param0.length
     * @param {number} param0.position
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.onProgress
     * @returns {Promise<Buffer>}
     */
    read({ path, offset, length, position, abortSignal, pauseSignal, onProgress }: {
        path: string;
        offset: number;
        length: number;
        position: number;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        onProgress?: ProgressCallback;
    }): Promise<Buffer>;
    /**
     * Alias of writeFile.
     * @date 2/20/2024 - 9:45:40 PM
     *
     * @public
     * @async
     * @param {...Parameters<typeof this.writeFile>} params
     * @returns {ReturnType<typeof this.writeFile>}
     */
    write(...params: Parameters<typeof this.writeFile>): ReturnType<typeof this.writeFile>;
    /**
     * Read a file at path. Warning: This reads the whole file into memory and can be pretty inefficient.
     * @date 2/16/2024 - 5:32:31 AM
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 	}} param0
     * @param {string} param0.path
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.onProgress
     * @returns {Promise<Buffer>}
     */
    readFile({ path, abortSignal, pauseSignal, onProgress }: {
        path: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        onProgress?: ProgressCallback;
    }): Promise<Buffer>;
    /**
     * Write to a file. Warning: This reads the whole file into memory and can be very inefficient. Only available in a Node.JS environment.
     * @date 2/16/2024 - 5:36:19 AM
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		content: Buffer
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 	}} param0
     * @param {string} param0.path
     * @param {Buffer} param0.content
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.onProgress
     * @returns {Promise<void>}
     */
    writeFile({ path, content, abortSignal, pauseSignal, onProgress }: {
        path: string;
        content: Buffer;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        onProgress?: ProgressCallback;
    }): Promise<CloudItem>;
    /**
     * Download a file or directory from path to a local destination path. Only available in a Node.JS environment.
     * @date 2/15/2024 - 5:59:23 AM
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		destination: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal,
     * 		onProgress?: ProgressCallback
     * 	}} param0
     * @param {string} param0.path
     * @param {string} param0.destination
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.onProgress
     * @returns {Promise<void>}
     */
    download({ path, destination, abortSignal, pauseSignal, onProgress }: {
        path: string;
        destination: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        onProgress?: ProgressCallback;
    }): Promise<void>;
    /**
     * Upload a file to path from a local source path. Recursively creates intermediate directories if needed. Only available in a Node.JS environment.
     * @date 2/16/2024 - 5:32:17 AM
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		source: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 	}} param0
     * @param {string} param0.path
     * @param {string} param0.source
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.onProgress
     * @returns {Promise<void>}
     */
    upload({ path, source, abortSignal, pauseSignal, onProgress }: {
        path: string;
        source: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        onProgress?: ProgressCallback;
    }): Promise<CloudItem>;
    /**
     * Copy a file or directory structure. Recursively creates intermediate directories if needed.
     * Warning: Can be really inefficient when copying large directory structures.
     * All files need to be downloaded first and then reuploaded due to our end to end encryption.
     * Plain copying unfortunately does not work. Only available in a Node.JS environment.
     * @date 2/14/2024 - 5:06:04 AM
     *
     * @public
     * @async
     * @param {{ from: string; to: string }} param0
     * @param {string} param0.from
     * @param {string} param0.to
     * @returns {Promise<void>}
     */
    cp({ from, to, abortSignal, pauseSignal, onProgress }: {
        from: string;
        to: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        onProgress?: ProgressCallback;
    }): Promise<void>;
    /**
     * Alias of cp.
     * @date 2/14/2024 - 5:07:27 AM
     *
     * @public
     * @async
     * @param {...Parameters<typeof this.cp>} params
     * @returns {ReturnType<typeof this.cp>}
     */
    copy(...params: Parameters<typeof this.cp>): ReturnType<typeof this.cp>;
}
export default FS;
