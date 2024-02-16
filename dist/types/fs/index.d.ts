/// <reference types="node" />
import type API from "../api";
import type Crypto from "../crypto";
import type { FilenSDKConfig } from "..";
import type { FolderMetadata, FileMetadata, FileEncryptionVersion, ProgressCallback } from "../types";
import type Cloud from "../cloud";
import type { PauseSignal } from "../cloud/signals";
export type FSConfig = {
    sdkConfig: FilenSDKConfig;
    api: API;
    crypto: Crypto;
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
    metadata: FolderMetadata & {
        timestamp: number;
    };
}) | (FSItemBase & {
    type: "file";
    metadata: FSItemFileBase & FileMetadata & {
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
    isSymbolicLink: () => boolean;
};
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
    private readonly crypto;
    private readonly sdkConfig;
    private readonly cloud;
    private _items;
    private _fileDescriptorsPaths;
    private _fileDescriptorsIds;
    private _nextFileDescriptor;
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
     * Rename or move a file/folder. Recursively creates intermediate directories if needed.
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
     * Deletes file/folder at path (Sends it to the trash).
     * @date 2/14/2024 - 2:16:42 AM
     *
     * @public
     * @async
     * @param {{ path: string }} param0
     * @param {string} param0.path
     * @returns {Promise<void>}
     */
    private _unlink;
    /**
     * Deletes file/folder at path (Sends it to the trash).
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
     * Deletes folder at path (Sends it to the trash).
     * @date 2/14/2024 - 2:53:48 AM
     *
     * @public
     * @async
     * @param {...Parameters<typeof this.unlink>} params
     * @returns {ReturnType<typeof this.unlink>}
     */
    rmdir(...params: Parameters<typeof this.unlink>): ReturnType<typeof this.unlink>;
    /**
     * Returns a file descriptor ID used for reading and writing.
     * @date 2/14/2024 - 4:45:55 AM
     *
     * @public
     * @async
     * @param {{path: string}} param0
     * @param {string} param0.path
     * @returns {Promise<number>}
     */
    open({ path, mode }: {
        path: string;
        mode?: "r" | "w" | "rw";
    }): Promise<number>;
    /**
     * Close a file descriptor.
     * @date 2/14/2024 - 4:58:38 AM
     *
     * @public
     * @async
     * @param {{fd: number}} param0
     * @param {number} param0.fd
     * @returns {Promise<void>}
     */
    close({ fd }: {
        fd: number;
    }): Promise<void>;
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
     * 		onProgress: ProgressCallback
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
        onProgress: ProgressCallback;
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
     * 		onProgress: ProgressCallback
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
        onProgress: ProgressCallback;
    }): Promise<void>;
    /**
     * Download a file from path to a local destination path. Only available in a Node.JS environment.
     * @date 2/15/2024 - 5:59:23 AM
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		destination: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal,
     * 		progress: ProgressCallback
     * 	}} param0
     * @param {string} param0.path
     * @param {string} param0.destination
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.progress
     * @returns {Promise<void>}
     */
    download({ path, destination, abortSignal, pauseSignal, onProgress }: {
        path: string;
        destination: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        onProgress: ProgressCallback;
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
     * 		onProgress: ProgressCallback
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
        onProgress: ProgressCallback;
    }): Promise<void>;
    /**
     * Copy a file or directory structure. Recursively creates intermediate directories if needed.
     * Warning: Can be really inefficient when copying large directory structures.
     * All files and folders need to be downloaded first and then reuploaded due to our end to end encryption.
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
    cp({ from, to }: {
        from: string;
        to: string;
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
