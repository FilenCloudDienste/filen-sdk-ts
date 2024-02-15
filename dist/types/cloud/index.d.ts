import type API from "../api";
import type Crypto from "../crypto";
import type { FilenSDKConfig } from "..";
import type DirColor from "../api/v3/dir/color";
import type { FileEncryptionVersion, FileMetadata, ProgressCallback } from "../types";
import { PauseSignal } from "./signals";
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
/**
 * Cloud
 * @date 2/14/2024 - 11:29:58 PM
 *
 * @export
 * @class Cloud
 * @typedef {Cloud}
 */
export declare class Cloud {
    protected readonly api: API;
    protected readonly crypto: Crypto;
    protected readonly sdkConfig: FilenSDKConfig;
    protected readonly _semaphores: {
        downloadThreads: import("../semaphore").ISemaphore;
        downloadWriters: import("../semaphore").ISemaphore;
    };
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
     * 		name: string
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
     * @param {string} param0.name
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
    downloadFileToLocal({ uuid, bucket, region, chunks, version, key, name, abortSignal, pauseSignal, chunksStart, chunksEnd, to, onProgress, onQueued, onStarted, onError, onFinished }: {
        uuid: string;
        bucket: string;
        region: string;
        chunks: number;
        version: FileEncryptionVersion;
        key: string;
        name: string;
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
}
export default Cloud;
