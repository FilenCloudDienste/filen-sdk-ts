/// <reference types="node" />
import type API from "../api";
import type { FilenSDKConfig } from "..";
import type { FolderMetadata, FileMetadata, FileEncryptionVersion, ProgressCallback, Prettify } from "../types";
import type { PauseSignal } from "../cloud/signals";
import type { CloudItem, Cloud } from "../cloud";
export type FSConfig = {
    sdkConfig: FilenSDKConfig;
    api: API;
    cloud: Cloud;
    connectToSocket?: boolean;
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
export type FSItemFileMetadata = Prettify<FSItemFileBase & FileMetadata>;
export type FSItem = Prettify<(FSItemBase & {
    type: "directory";
    metadata: FolderMetadata;
}) | (FSItemBase & {
    type: "file";
    metadata: FSItemFileMetadata;
})>;
export type FSItems = Record<string, FSItem>;
export type FSStatsBase = {
    size: number;
    mtimeMs: number;
    birthtimeMs: number;
    isDirectory: () => boolean;
    isFile: () => boolean;
    isSymbolicLink: () => boolean;
};
export type FSStats = Prettify<(FolderMetadata & FSStatsBase & {
    type: "directory";
    uuid: string;
}) | (FSItemFileBase & FileMetadata & FSStatsBase & {
    type: "file";
    uuid: string;
})>;
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
export type FSItemUUID = FSItem & {
    path: string;
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
    _items: FSItems;
    _uuidToItem: Record<string, FSItemUUID>;
    private readonly socket;
    private readonly mutex;
    private readonly mkdirMutex;
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
     * Attach listeners for relevant realtime events.
     * @date 3/1/2024 - 7:23:35 PM
     *
     * @private
     */
    private _initSocketEvents;
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
    pathToItemUUID({ path, type }: {
        path: string;
        type?: FSItemType;
    }): Promise<string | null>;
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
     * @returns {Promise<string[]>}
     */
    ls(...params: Parameters<typeof this.readdir>): Promise<string[]>;
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
     * @returns {Promise<FSStats>}
     */
    lstat(...params: Parameters<typeof this.stat>): Promise<FSStats>;
    /**
     * Creates a directory at path. Recursively creates intermediate directories if they don't exist.
     * @date 2/14/2024 - 1:34:11 AM
     *
     * @public
     * @async
     * @param {{ path: string }} param0
     * @param {string} param0.path
     * @returns {Promise<string>}
     */
    mkdir({ path }: {
        path: string;
    }): Promise<string>;
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
     * Deletes file/directoy at path.
     * @date 2/28/2024 - 4:57:19 PM
     *
     * @private
     * @async
     * @param {{ path: string; type?: FSItemType, permanent?: boolean }} param0
     * @param {string} param0.path
     * @param {FSItemType} param0.type
     * @param {boolean} [param0.permanent=false]
     * @returns {Promise<void>}
     */
    private _unlink;
    /**
     * Deletes file/directory at path.
     * @date 2/28/2024 - 4:58:37 PM
     *
     * @public
     * @async
     * @param {{ path: string, permanent?: boolean }} param0
     * @param {string} param0.path
     * @param {boolean} [param0.permanent=false]
     * @returns {Promise<void>}
     */
    unlink({ path, permanent }: {
        path: string;
        permanent?: boolean;
    }): Promise<void>;
    /**
     * Alias of unlink.
     * @date 2/28/2024 - 4:58:30 PM
     *
     * @public
     * @async
     * @param {{ path: string, permanent?: boolean }} param0
     * @param {string} param0.path
     * @param {boolean} [param0.permanent=false]
     * @returns {Promise<void>}
     */
    rm({ path, permanent }: {
        path: string;
        permanent?: boolean;
    }): Promise<void>;
    /**
     * Deletes directory at path.
     * @date 2/14/2024 - 2:53:48 AM
     *
     * @public
     * @async
     * @param {...Parameters<typeof this.unlink>} params
     * @returns {Promise<void>}
     */
    rmdir(...params: Parameters<typeof this.unlink>): Promise<void>;
    /**
     * Deletes a file at path.
     *
     * @public
     * @async
     * @param {...Parameters<typeof this.unlink>} params
     * @returns {Promise<void>}
     */
    rmfile(...params: Parameters<typeof this.unlink>): Promise<void>;
    /**
     * Read a file. Returns buffer of given length, at position and offset. Memory efficient to read only a small part of a file.
     * @date 3/18/2024 - 12:07:38 AM
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		offset?: number
     * 		length?: number
     * 		position?: number
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
        offset?: number;
        length?: number;
        position?: number;
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
     * @returns {Promise<CloudItem>}
     */
    write(...params: Parameters<typeof this.writeFile>): Promise<CloudItem>;
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
     * @returns {Promise<void>}
     */
    copy(...params: Parameters<typeof this.cp>): Promise<void>;
}
export default FS;
