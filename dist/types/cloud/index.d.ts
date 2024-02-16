import type API from "../api";
import type Crypto from "../crypto";
import type { FilenSDKConfig } from "..";
import type DirColor from "../api/v3/dir/color";
import type { FileEncryptionVersion, FileMetadata, ProgressCallback } from "../types";
import { PauseSignal } from "./signals";
import type { DirColors } from "../api/v3/dir/color";
import type { FileVersionsResponse } from "../api/v3/file/versions";
import type { DirDownloadType } from "../api/v3/dir/download";
export type CloudConfig = {
    sdkConfig: FilenSDKConfig;
    api: API;
    crypto: Crypto;
};
export type CloudItemReceiver = {
    id: number;
    email: string;
};
export type CloudItemBase = {
    uuid: string;
    name: string;
    timestamp: number;
    favorited: boolean;
    lastModified: number;
    parent: string;
};
export type CloudItemFile = {
    size: number;
    mime: string;
    rm: string;
    version: FileEncryptionVersion;
    chunks: number;
    key: string;
    bucket: string;
    region: string;
    creation?: number;
    hash?: string;
};
export type CloudItemBaseShared = Omit<CloudItemBase, "favorited">;
export type CloudItemFileShared = Omit<CloudItemFile, "rm">;
export type CloudItemDirectory = {
    color: DirColor | null;
};
export type CloudItem = ({
    type: "directory";
} & CloudItemBase & CloudItemDirectory) | ({
    type: "file";
} & CloudItemBase & CloudItemFile);
export type CloudItemSharedBase = {
    sharerEmail: string;
    sharerId: number;
    receiverEmail: string;
    receiverId: number;
};
export type CloudItemShared = ({
    type: "directory";
} & CloudItemBaseShared & CloudItemDirectory & CloudItemSharedBase) | ({
    type: "file";
} & CloudItemBaseShared & CloudItemFileShared & CloudItemSharedBase);
export type CloudItemTree = Omit<{
    type: "directory";
} & CloudItemBase & CloudItemDirectory, "color" | "favorited" | "timestamp" | "lastModified"> | Omit<{
    type: "file";
} & CloudItemBase & CloudItemFile, "favorited" | "rm" | "timestamp">;
/**
 * Cloud
 * @date 2/14/2024 - 11:29:58 PM
 *
 * @export
 * @class Cloud
 * @typedef {Cloud}
 */
export declare class Cloud {
    private readonly api;
    private readonly crypto;
    private readonly sdkConfig;
    private readonly _semaphores;
    /**
     * Creates an instance of Cloud.
     * @date 2/14/2024 - 11:30:03 PM
     *
     * @constructor
     * @public
     * @param {CloudConfig} params
     */
    constructor(params: CloudConfig);
    readonly utils: {
        signals: {
            PauseSignal: typeof PauseSignal;
        };
        utils: {
            readLocalFileChunk: typeof import("./utils").readLocalFileChunk;
            readWebFileChunk: typeof import("./utils").readWebFileChunk;
        };
    };
    /**
     * Lists all files and directories in a directory.
     * @date 2/14/2024 - 11:39:25 PM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<CloudItem[]>}
     */
    listDirectory({ uuid }: {
        uuid: string;
    }): Promise<CloudItem[]>;
    /**
     * List shared in files and directories based on parent.
     * @date 2/15/2024 - 1:16:49 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<CloudItemShared[]>}
     */
    listDirectorySharedIn({ uuid }: {
        uuid: string;
    }): Promise<CloudItemShared[]>;
    /**
     * List shared out files and directories based on parent.
     * @date 2/15/2024 - 1:16:32 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; receiverId?: number }} param0
     * @param {string} param0.uuid
     * @param {number} param0.receiverId
     * @returns {Promise<CloudItemShared[]>}
     */
    listDirectorySharedOut({ uuid, receiverId }: {
        uuid: string;
        receiverId?: number;
    }): Promise<CloudItemShared[]>;
    /**
     * List all recently uploaded files.
     * @date 2/15/2024 - 1:16:20 AM
     *
     * @public
     * @async
     * @returns {Promise<CloudItem[]>}
     */
    listRecents(): Promise<CloudItem[]>;
    /**
     * List all files and directories inside the trash.
     * @date 2/15/2024 - 8:59:04 PM
     *
     * @public
     * @async
     * @returns {Promise<CloudItem[]>}
     */
    listTrash(): Promise<CloudItem[]>;
    /**
     * List all favorite files and directories.
     * @date 2/15/2024 - 8:59:52 PM
     *
     * @public
     * @async
     * @returns {Promise<CloudItem[]>}
     */
    listFavorites(): Promise<CloudItem[]>;
    /**
     * List all public linked files and directories.
     * @date 2/15/2024 - 9:01:01 PM
     *
     * @public
     * @async
     * @returns {Promise<CloudItem[]>}
     */
    listPublicLinks(): Promise<CloudItem[]>;
    /**
     * Rename a file.
     * @date 2/15/2024 - 1:23:33 AM
     *
     * @public
     * @async
     * @param {{uuid: string, metadata: FileMetadata, name: string}} param0
     * @param {string} param0.uuid
     * @param {FileMetadata} param0.metadata
     * @param {string} param0.name
     * @returns {Promise<void>}
     */
    renameFile({ uuid, metadata, name }: {
        uuid: string;
        metadata: FileMetadata;
        name: string;
    }): Promise<void>;
    /**
     * Rename a directory.
     * @date 2/15/2024 - 1:26:43 AM
     *
     * @public
     * @async
     * @param {{uuid: string, name: string}} param0
     * @param {string} param0.uuid
     * @param {string} param0.name
     * @returns {Promise<void>}
     */
    renameDirectory({ uuid, name }: {
        uuid: string;
        name: string;
    }): Promise<void>;
    /**
     * Move a file.
     * @date 2/15/2024 - 1:27:38 AM
     *
     * @public
     * @async
     * @param {{uuid: string, to: string}} param0
     * @param {string} param0.uuid
     * @param {string} param0.to
     * @returns {Promise<void>}
     */
    moveFile({ uuid, to }: {
        uuid: string;
        to: string;
    }): Promise<void>;
    /**
     * Move a directory.
     * @date 2/15/2024 - 1:27:42 AM
     *
     * @public
     * @async
     * @param {{uuid: string, to: string}} param0
     * @param {string} param0.uuid
     * @param {string} param0.to
     * @returns {Promise<void>}
     */
    moveDirectory({ uuid, to }: {
        uuid: string;
        to: string;
    }): Promise<void>;
    /**
     * Send a file to the trash bin.
     * @date 2/15/2024 - 2:07:13 AM
     *
     * @public
     * @async
     * @param {{uuid: string}} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    trashFile({ uuid }: {
        uuid: string;
    }): Promise<void>;
    /**
     * Send a directory to the trash bin.
     * @date 2/15/2024 - 2:07:13 AM
     *
     * @public
     * @async
     * @param {{uuid: string}} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    trashDirectory({ uuid }: {
        uuid: string;
    }): Promise<void>;
    /**
     * Create a directory under parent.
     * @date 2/15/2024 - 2:27:36 AM
     *
     * @public
     * @async
     * @param {{ uuid?: string; name: string; parent: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.name
     * @param {string} param0.parent
     * @returns {Promise<string>}
     */
    createDirectory({ uuid, name, parent }: {
        uuid?: string;
        name: string;
        parent: string;
    }): Promise<string>;
    /**
     * Change the color of a directory.
     * @date 2/15/2024 - 8:52:40 PM
     *
     * @public
     * @async
     * @param {{uuid: string, color: DirColors}} param0
     * @param {string} param0.uuid
     * @param {DirColors} param0.color
     * @returns {Promise<void>}
     */
    changeDirectoryColor({ uuid, color }: {
        uuid: string;
        color: DirColors;
    }): Promise<void>;
    /**
     * Toggle the favorite status of a directory.
     * @date 2/15/2024 - 8:54:03 PM
     *
     * @public
     * @async
     * @param {{uuid: string, favorite: boolean}} param0
     * @param {string} param0.uuid
     * @param {boolean} param0.favorite
     * @returns {Promise<void>}
     */
    favoriteDirectory({ uuid, favorite }: {
        uuid: string;
        favorite: boolean;
    }): Promise<void>;
    /**
     * Toggle the favorite status of a file.
     * @date 2/15/2024 - 8:54:23 PM
     *
     * @public
     * @async
     * @param {{uuid: string, favorite: boolean}} param0
     * @param {string} param0.uuid
     * @param {boolean} param0.favorite
     * @returns {Promise<void>}
     */
    favoriteFile({ uuid, favorite }: {
        uuid: string;
        favorite: boolean;
    }): Promise<void>;
    /**
     * Permanently delete a file.
     * @date 2/15/2024 - 11:42:05 PM
     *
     * @public
     * @async
     * @param {{uuid: string}} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    deleteFile({ uuid }: {
        uuid: string;
    }): Promise<void>;
    /**
     * Permanently delete a directory.
     * @date 2/15/2024 - 11:42:13 PM
     *
     * @public
     * @async
     * @param {{uuid: string}} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    deleteDirectory({ uuid }: {
        uuid: string;
    }): Promise<void>;
    /**
     * Restore a file from the trash.
     * @date 2/15/2024 - 11:43:21 PM
     *
     * @public
     * @async
     * @param {{uuid: string}} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    restoreFile({ uuid }: {
        uuid: string;
    }): Promise<void>;
    /**
     * Restore a directory from the trash.
     * @date 2/15/2024 - 11:43:29 PM
     *
     * @public
     * @async
     * @param {{uuid: string}} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    restoreDirectory({ uuid }: {
        uuid: string;
    }): Promise<void>;
    /**
     * Restore a file version.
     * @date 2/15/2024 - 11:44:51 PM
     *
     * @public
     * @async
     * @param {{uuid:string, currentUUID:string}} param0
     * @param {string} param0.uuid
     * @param {string} param0.currentUUID
     * @returns {Promise<void>}
     */
    restoreFileVersion({ uuid, currentUUID }: {
        uuid: string;
        currentUUID: string;
    }): Promise<void>;
    /**
     * Retrieve all versions of a file.
     * @date 2/15/2024 - 11:46:38 PM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<FileVersionsResponse>}
     */
    fileVersions({ uuid }: {
        uuid: string;
    }): Promise<FileVersionsResponse>;
    /**
     * Download a file to a local path. Only works in a Node.JS environment.
     * @date 2/15/2024 - 7:39:34 AM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		bucket: string
     * 		region: string
     * 		chunks: number
     * 		version: FileEncryptionVersion
     * 		key: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		chunksStart?: number
     * 		chunksEnd?: number
     * 		to?: string
     * 		onProgress?: ProgressCallback
     * 		onQueued?: () => void
     * 		onStarted?: () => void
     * 		onError?: (err: Error) => void
     * 		onFinished?: () => void
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.bucket
     * @param {string} param0.region
     * @param {number} param0.chunks
     * @param {FileEncryptionVersion} param0.version
     * @param {string} param0.key
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {number} param0.chunksStart
     * @param {number} param0.chunksEnd
     * @param {string} param0.to
     * @param {ProgressCallback} param0.onProgress
     * @param {() => void} param0.onQueued
     * @param {() => void} param0.onStarted
     * @param {(err: Error) => void} param0.onError
     * @param {() => void} param0.onFinished
     * @returns {Promise<string>}
     */
    downloadFileToLocal({ uuid, bucket, region, chunks, version, key, abortSignal, pauseSignal, chunksStart, chunksEnd, to, onProgress, onQueued, onStarted, onError, onFinished }: {
        uuid: string;
        bucket: string;
        region: string;
        chunks: number;
        version: FileEncryptionVersion;
        key: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        chunksStart?: number;
        chunksEnd?: number;
        to?: string;
        onProgress?: ProgressCallback;
        onQueued?: () => void;
        onStarted?: () => void;
        onError?: (err: Error) => void;
        onFinished?: () => void;
    }): Promise<string>;
    /**
     * Download a file to a ReadableStream.
     * @date 2/15/2024 - 7:36:05 AM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		bucket: string
     * 		region: string
     * 		chunks: number
     * 		version: FileEncryptionVersion
     * 		key: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		chunksStart?: number
     * 		chunksEnd?: number
     * 		onProgress?: ProgressCallback
     * 		onQueued?: () => void
     * 		onStarted?: () => void
     * 		onError?: (err: Error) => void
     * 		onFinished?: () => void
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.bucket
     * @param {string} param0.region
     * @param {number} param0.chunks
     * @param {FileEncryptionVersion} param0.version
     * @param {string} param0.key
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {number} param0.chunksStart
     * @param {number} param0.chunksEnd
     * @param {ProgressCallback} param0.onProgress
     * @param {() => void} param0.onQueued
     * @param {() => void} param0.onStarted
     * @param {(err: Error) => void} param0.onError
     * @param {() => void} param0.onFinished
     * @returns {Promise<ReadableStream>}
     */
    downloadFileToReadableStream({ uuid, bucket, region, chunks, version, key, abortSignal, pauseSignal, chunksStart, chunksEnd, onProgress, onQueued, onStarted, onError, onFinished }: {
        uuid: string;
        bucket: string;
        region: string;
        chunks: number;
        version: FileEncryptionVersion;
        key: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        chunksStart?: number;
        chunksEnd?: number;
        onProgress?: ProgressCallback;
        onQueued?: () => void;
        onStarted?: () => void;
        onError?: (err: Error) => void;
        onFinished?: () => void;
    }): Promise<ReadableStream>;
    /**
     * Build a recursive directory tree which includes sub-directories and sub-files.
     * Tree looks like this:
     * {
     * 		"path": CloudItemTree,
     * 		"path": CloudItemTree,
     * 		"path": CloudItemTree
     * }
     * @date 2/16/2024 - 12:24:25 AM
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
     * 	}} param0
     * @param {string} param0.uuid
     * @param {DirDownloadType} [param0.type="normal"]
     * @param {string} param0.linkUUID
     * @param {boolean} param0.linkHasPassword
     * @param {string} param0.linkPassword
     * @param {string} param0.linkSalt
     * @returns {Promise<Record<string, CloudItemTree>>}
     */
    getDirectoryTree({ uuid, type, linkUUID, linkHasPassword, linkPassword, linkSalt }: {
        uuid: string;
        type?: DirDownloadType;
        linkUUID?: string;
        linkHasPassword?: boolean;
        linkPassword?: string;
        linkSalt?: string;
    }): Promise<Record<string, CloudItemTree>>;
    /**
     * Download a directory to path. Only available in a Node.JS environment.
     * @date 2/16/2024 - 1:30:09 AM
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
     * 		to?: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 		onQueued?: () => void
     * 		onStarted?: () => void
     * 		onError?: (err: Error) => void
     * 		onFinished?: () => void
     * 	}} param0
     * @param {string} param0.uuid
     * @param {DirDownloadType} [param0.type="normal"]
     * @param {string} param0.linkUUID
     * @param {boolean} param0.linkHasPassword
     * @param {string} param0.linkPassword
     * @param {string} param0.linkSalt
     * @param {string} param0.to
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {() => void} param0.onQueued
     * @param {() => void} param0.onStarted
     * @param {(err: Error) => void} param0.onError
     * @param {() => void} param0.onFinished
     * @returns {Promise<string>}
     */
    downloadDirectoryToLocal({ uuid, type, linkUUID, linkHasPassword, linkPassword, linkSalt, to, abortSignal, pauseSignal, onQueued, onStarted, onError, onFinished }: {
        uuid: string;
        type?: DirDownloadType;
        linkUUID?: string;
        linkHasPassword?: boolean;
        linkPassword?: string;
        linkSalt?: string;
        to?: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        onProgress?: ProgressCallback;
        onQueued?: () => void;
        onStarted?: () => void;
        onError?: (err: Error) => void;
        onFinished?: () => void;
    }): Promise<string>;
    /**
     * Upload a local file. Only available in a Node.JS environment.
     * @date 2/16/2024 - 5:13:26 AM
     *
     * @public
     * @async
     * @param {{
     * 		source: string
     * 		parent: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 		onQueued?: () => void
     * 		onStarted?: () => void
     * 		onError?: (err: Error) => void
     * 		onFinished?: () => void
     * 		onUploaded?: (item: CloudItem) => Promise<void>
     * 	}} param0
     * @param {string} param0.source
     * @param {string} param0.parent
     * @param {PauseSignal} param0.pauseSignal
     * @param {AbortSignal} param0.abortSignal
     * @param {ProgressCallback} param0.onProgress
     * @param {() => void} param0.onQueued
     * @param {() => void} param0.onStarted
     * @param {(err: Error) => void} param0.onError
     * @param {() => void} param0.onFinished
     * @param {(item: CloudItem) => Promise<void>} param0.onUploaded
     * @returns {Promise<CloudItem>}
     */
    uploadFileFromLocal({ source, parent, pauseSignal, abortSignal, onProgress, onQueued, onStarted, onError, onFinished, onUploaded }: {
        source: string;
        parent: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        onProgress?: ProgressCallback;
        onQueued?: () => void;
        onStarted?: () => void;
        onError?: (err: Error) => void;
        onFinished?: () => void;
        onUploaded?: (item: CloudItem) => Promise<void>;
    }): Promise<CloudItem>;
    /**
     * Upload a web-based file, such as from an <input /> field. Only works in a browser environment.
     * @date 2/16/2024 - 5:50:00 AM
     *
     * @public
     * @async
     * @param {{
     * 		file: File
     * 		parent: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 		onQueued?: () => void
     * 		onStarted?: () => void
     * 		onError?: (err: Error) => void
     * 		onFinished?: () => void
     * 		onUploaded?: (item: CloudItem) => Promise<void>
     * 	}} param0
     * @param {File} param0.file
     * @param {string} param0.parent
     * @param {PauseSignal} param0.pauseSignal
     * @param {AbortSignal} param0.abortSignal
     * @param {ProgressCallback} param0.onProgress
     * @param {() => void} param0.onQueued
     * @param {() => void} param0.onStarted
     * @param {(err: Error) => void} param0.onError
     * @param {() => void} param0.onFinished
     * @param {(item: CloudItem) => Promise<void>} param0.onUploaded
     * @returns {Promise<CloudItem>}
     */
    uploadWebFile({ file, parent, pauseSignal, abortSignal, onProgress, onQueued, onStarted, onError, onFinished, onUploaded }: {
        file: File;
        parent: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        onProgress?: ProgressCallback;
        onQueued?: () => void;
        onStarted?: () => void;
        onError?: (err: Error) => void;
        onFinished?: () => void;
        onUploaded?: (item: CloudItem) => Promise<void>;
    }): Promise<CloudItem>;
}
export default Cloud;
