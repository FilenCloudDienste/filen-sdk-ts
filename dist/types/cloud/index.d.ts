/// <reference types="node" />
/// <reference types="node" />
import type API from "../api";
import { type FilenSDKConfig, type FilenSDK } from "..";
import { type FileEncryptionVersion, type FileMetadata, type ProgressCallback, type FolderMetadata, type PublicLinkExpiration, type ProgressWithTotalCallback, type GetFileResult, type GetDirResult } from "../types";
import { PauseSignal } from "./signals";
import { type DirColors } from "../api/v3/dir/color";
import { type FileVersionsResponse } from "../api/v3/file/versions";
import { type DirDownloadType } from "../api/v3/dir/download";
import { type DirLinkStatusResponse } from "../api/v3/dir/link/status";
import { type FileLinkStatusResponse } from "../api/v3/file/link/status";
import { type FileLinkPasswordResponse } from "../api/v3/file/link/password";
import { type DirLinkInfoDecryptedResponse } from "../api/v3/dir/link/info";
import { type FileLinkInfoResponse } from "../api/v3/file/link/info";
import { type DirLinkContentDecryptedResponse } from "../api/v3/dir/link/content";
import { type FileExistsResponse } from "../api/v3/file/exists";
import { type DirExistsResponse } from "../api/v3/dir/exists";
export type CloudConfig = {
    sdkConfig: FilenSDKConfig;
    api: API;
    sdk: FilenSDK;
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
    color: DirColors | null;
    size: number;
};
export type CloudItem = ({
    type: "directory";
} & CloudItemBase & CloudItemDirectory) | ({
    type: "file";
} & CloudItemBase & CloudItemFile);
export type CloudItemSharedReceiver = {
    id: number;
    email: string;
};
export type CloudItemSharedBase = {
    sharerEmail: string;
    sharerId: number;
    receiverEmail: string;
    receiverId: number;
    receivers: CloudItemSharedReceiver[];
};
export type CloudItemShared = ({
    type: "directory";
} & CloudItemBaseShared & CloudItemDirectory & CloudItemSharedBase) | ({
    type: "file";
} & CloudItemBaseShared & CloudItemFileShared & CloudItemSharedBase);
export type CloudItemTree = Omit<{
    type: "directory";
} & CloudItemBase & CloudItemDirectory, "color" | "favorited"> | Omit<{
    type: "file";
} & CloudItemBase & CloudItemFile, "favorited" | "rm">;
export type FileToShare = {
    uuid: string;
    parent: string;
    metadata: FileMetadata;
};
export type DirectoryToShare = {
    uuid: string;
    parent: string;
    metadata: FolderMetadata;
};
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
    private readonly sdkConfig;
    private readonly sdk;
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
            calculateChunkIndices: typeof import("./utils").calculateChunkIndices;
        };
    };
    /**
     * Lists all files and directories in a directory.
     * @date 3/14/2024 - 5:21:55 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, onlyDirectories?: boolean }} param0
     * @param {string} param0.uuid
     * @param {boolean} param0.onlyDirectories
     * @returns {Promise<CloudItem[]>}
     */
    listDirectory({ uuid, onlyDirectories }: {
        uuid: string;
        onlyDirectories?: boolean;
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
     * Check if a file with <NAME> exists in parent.
     *
     * @public
     * @async
     * @param {{ name: string; parent: string }} param0
     * @param {string} param0.name
     * @param {string} param0.parent
     * @returns {Promise<FileExistsResponse>}
     */
    fileExists({ name, parent }: {
        name: string;
        parent: string;
    }): Promise<FileExistsResponse>;
    /**
     * Check if a directory with <NAME> exists in parent.
     *
     * @public
     * @async
     * @param {{ name: string; parent: string }} param0
     * @param {string} param0.name
     * @param {string} param0.parent
     * @returns {Promise<DirExistsResponse>}
     */
    directoryExists({ name, parent }: {
        name: string;
        parent: string;
    }): Promise<DirExistsResponse>;
    /**
     * Edit metadata of a file (currently uses the rename endpoint, might change later).
     *
     * @public
     * @async
     * @param {{ uuid: string; metadata: FileMetadata }} param0
     * @param {string} param0.uuid
     * @param {FileMetadata} param0.metadata
     * @returns {Promise<void>}
     */
    editFileMetadata({ uuid, metadata }: {
        uuid: string;
        metadata: FileMetadata;
    }): Promise<void>;
    /**
     * Rename a file.
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		metadata: FileMetadata
     * 		name: string
     * 		overwriteIfExists?: boolean
     * 	}} param0
     * @param {string} param0.uuid
     * @param {FileMetadata} param0.metadata
     * @param {string} param0.name
     * @param {boolean} [param0.overwriteIfExists=false]
     * @returns {Promise<void>}
     */
    renameFile({ uuid, metadata, name, overwriteIfExists }: {
        uuid: string;
        metadata: FileMetadata;
        name: string;
        overwriteIfExists?: boolean;
    }): Promise<void>;
    /**
     * Rename a directory.
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		name: string
     * 		overwriteIfExists?: boolean
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.name
     * @param {boolean} [param0.overwriteIfExists=false]
     * @returns {Promise<void>}
     */
    renameDirectory({ uuid, name, overwriteIfExists }: {
        uuid: string;
        name: string;
        overwriteIfExists?: boolean;
    }): Promise<void>;
    /**
     * Move a file.
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		to: string
     * 		metadata: FileMetadata
     * 		overwriteIfExists?: boolean
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.to
     * @param {FileMetadata} param0.metadata
     * @param {boolean} [param0.overwriteIfExists=false]
     * @returns {Promise<void>}
     */
    moveFile({ uuid, to, metadata, overwriteIfExists }: {
        uuid: string;
        to: string;
        metadata: FileMetadata;
        overwriteIfExists?: boolean;
    }): Promise<void>;
    /**
     * Move a directory.
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		to: string
     * 		metadata: FolderMetadata
     * 		overwriteIfExists?: boolean
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.to
     * @param {FolderMetadata} param0.metadata
     * @param {boolean} [param0.overwriteIfExists=false]
     * @returns {Promise<void>}
     */
    moveDirectory({ uuid, to, metadata, overwriteIfExists }: {
        uuid: string;
        to: string;
        metadata: FolderMetadata;
        overwriteIfExists?: boolean;
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
     *
     * @public
     * @async
     * @param {{
     * 		uuid?: string
     * 		name: string
     * 		parent: string
     * 		renameIfExists?: boolean
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.name
     * @param {string} param0.parent
     * @param {boolean} [param0.renameIfExists=false]
     * @returns {Promise<string>}
     */
    createDirectory({ uuid, name, parent, renameIfExists }: {
        uuid?: string;
        name: string;
        parent: string;
        renameIfExists?: boolean;
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
     * Share an item to another Filen user.
     * @date 2/17/2024 - 4:11:05 AM
     *
     * @private
     * @async
     * @param {{
     * 		uuid: string
     * 		parent: string
     * 		email: string
     * 		type: "file" | "folder"
     * 		publicKey: string
     * 		metadata: FileMetadata | FolderMetadata
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.parent
     * @param {string} param0.email
     * @param {("file" | "folder")} param0.type
     * @param {string} param0.publicKey
     * @param {*} param0.metadata
     * @returns {Promise<void>}
     */
    private shareItem;
    /**
     * Add an item to a directory public link.
     * @date 2/19/2024 - 5:08:51 AM
     *
     * @private
     * @async
     * @param {{
     * 		uuid: string
     * 		parent: string
     * 		linkUUID: string
     * 		type: "file" | "folder"
     * 		metadata: FileMetadata | FolderMetadata
     * 		linkKeyEncrypted: string
     * 		expiration: PublicLinkExpiration
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.parent
     * @param {string} param0.linkUUID
     * @param {("file" | "folder")} param0.type
     * @param {*} param0.metadata
     * @param {string} param0.linkKeyEncrypted
     * @param {PublicLinkExpiration} param0.expiration
     * @returns {Promise<void>}
     */
    private addItemToDirectoryPublicLink;
    /**
     * Enable a public link for a file or a directory.
     * @date 2/19/2024 - 5:13:57 AM
     *
     * @public
     * @async
     * @param {{
     * 		type: "file" | "directory"
     * 		uuid: string
     * 		onProgress?: ProgressWithTotalCallback
     * 	}} param0
     * @param {("file" | "directory")} param0.type
     * @param {string} param0.uuid
     * @param {ProgressWithTotalCallback} param0.onProgress
     * @returns {Promise<string>}
     */
    enablePublicLink({ type, uuid, onProgress }: {
        type: "file" | "directory";
        uuid: string;
        onProgress?: ProgressWithTotalCallback;
    }): Promise<string>;
    /**
     * Edit a file/directory public link.
     * @date 2/19/2024 - 4:57:03 AM
     *
     * @public
     * @async
     * @param {{
     * 		type: "file" | "directory"
     * 		itemUUID: string
     * 		linkUUID?: string
     * 		password?: string
     * 		enableDownload?: boolean
     * 		expiration: PublicLinkExpiration
     * 	}} param0
     * @param {("file" | "directory")} param0.type
     * @param {string} param0.itemUUID
     * @param {string} param0.linkUUID
     * @param {string} param0.password
     * @param {boolean} [param0.enableDownload=true]
     * @param {PublicLinkExpiration} [param0.expiration="never"]
     * @returns {Promise<void>}
     */
    editPublicLink({ type, itemUUID, linkUUID, password, enableDownload, expiration }: {
        type: "file" | "directory";
        itemUUID: string;
        linkUUID?: string;
        password?: string;
        enableDownload?: boolean;
        expiration: PublicLinkExpiration;
    }): Promise<void>;
    disablePublicLink({ type, itemUUID }: {
        type: "directory";
        itemUUID: string;
    }): Promise<void>;
    disablePublicLink({ type, itemUUID, linkUUID }: {
        type: "file";
        itemUUID: string;
        linkUUID: string;
    }): Promise<void>;
    publicLinkStatus({ type, uuid }: {
        type: "file";
        uuid: string;
    }): Promise<FileLinkStatusResponse>;
    publicLinkStatus({ type, uuid }: {
        type: "directory";
        uuid: string;
    }): Promise<DirLinkStatusResponse>;
    /**
     * Fetch password info of a public link.
     *
     * @public
     * @async
     * @param {{uuid: string}} param0
     * @param {string} param0.uuid
     * @returns {Promise<FileLinkPasswordResponse>}
     */
    filePublicLinkHasPassword({ uuid }: {
        uuid: string;
    }): Promise<FileLinkPasswordResponse>;
    /**
     * Fetch info of a file public link.
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		password?: string
     * 		salt?: string
     * 		key: string
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.password
     * @param {string} param0.salt
     * @param {string} param0.key
     * @returns {(Promise<Omit<FileLinkInfoResponse, "size"> & { size: number }>)}
     */
    filePublicLinkInfo({ uuid, password, salt, key }: {
        uuid: string;
        password?: string;
        salt?: string;
        key: string;
    }): Promise<Omit<FileLinkInfoResponse, "size"> & {
        size: number;
    }>;
    /**
     * Fetch info about a directory public link.
     *
     * @public
     * @async
     * @param {{ uuid: string, key: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.key
     * @returns {Promise<DirLinkInfoDecryptedResponse>}
     */
    directoryPublicLinkInfo({ uuid, key }: {
        uuid: string;
        key: string;
    }): Promise<DirLinkInfoDecryptedResponse>;
    /**
     * Fetch contents of a directory public link or it's children.
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		parent: string
     * 		password?: string
     * 		salt?: string
     * 		key: string
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.parent
     * @param {string} param0.password
     * @param {string} param0.salt
     * @param {string} param0.key
     * @returns {Promise<DirLinkContentDecryptedResponse>}
     */
    directoryPublicLinkContent({ uuid, parent, password, salt, key }: {
        uuid: string;
        parent: string;
        password?: string;
        salt?: string;
        key: string;
    }): Promise<DirLinkContentDecryptedResponse>;
    /**
     * Stop sharing an item with another user.
     * @date 2/19/2024 - 4:38:21 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; receiverId: number }} param0
     * @param {string} param0.uuid
     * @param {number} param0.receiverId
     * @returns {Promise<void>}
     */
    stopSharingItem({ uuid, receiverId }: {
        uuid: string;
        receiverId: number;
    }): Promise<void>;
    /**
     * Stop receiving a shared item.
     * @date 2/19/2024 - 4:38:36 AM
     *
     * @public
     * @async
     * @param {{uuid: string}} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    removeSharedItem({ uuid }: {
        uuid: string;
    }): Promise<void>;
    /**
     * Share a file or a directory (and all it's children) to a user.
     * @date 2/19/2024 - 4:35:03 AM
     *
     * @public
     * @async
     * @param {{
     * 		files: { uuid: string; parent: string; metadata: FileMetadata }[]
     * 		directories: { uuid: string; parent: string; metadata: FolderMetadata }[]
     * 		email: string
     * 		onProgress?: ProgressWithTotalCallback
     * 	}} param0
     * @param {{}} param0.files
     * @param {{}} param0.directories
     * @param {string} param0.email
     * @param {ProgressWithTotalCallback} param0.onProgress
     * @returns {Promise<void>}
     */
    shareItemsToUser({ files, directories, email, onProgress }: {
        files: {
            uuid: string;
            parent: string;
            metadata: FileMetadata;
        }[];
        directories: {
            uuid: string;
            parent: string;
            metadata: FolderMetadata;
        }[];
        email: string;
        onProgress?: ProgressWithTotalCallback;
    }): Promise<void>;
    /**
     * Checks if the parent of an item is shared or public linked.
     * If so, it adds the item and all children of the item (in case of a directory) to the share or public link.
     * @date 2/17/2024 - 4:26:44 AM
     *
     * @public
     * @async
     * @param {{
     * 		type: "file" | "directory"
     * 		parent: string
     * 		uuid: string
     * 		itemMetadata: FileMetadata | FolderMetadata
     * 	}} param0
     * @param {("file" | "directory")} param0.type
     * @param {string} param0.parent
     * @param {string} param0.uuid
     * @param {*} param0.itemMetadata
     * @returns {Promise<void>}
     */
    checkIfItemParentIsShared({ type, parent, uuid, itemMetadata }: {
        type: "file" | "directory";
        parent: string;
        uuid: string;
        itemMetadata: FileMetadata | FolderMetadata;
    }): Promise<void>;
    /**
     * Rename a shared item.
     * @date 2/17/2024 - 4:32:56 AM
     *
     * @private
     * @async
     * @param {({uuid: string, receiverId: number, metadata: FileMetadata | FolderMetadata, publicKey: string})} param0
     * @param {string} param0.uuid
     * @param {number} param0.receiverId
     * @param {*} param0.metadata
     * @param {string} param0.publicKey
     * @returns {Promise<void>}
     */
    private renameSharedItem;
    /**
     * Rename a publicly linked item.
     * @date 2/17/2024 - 4:35:07 AM
     *
     * @private
     * @async
     * @param {({uuid: string, linkUUID: string, metadata: FileMetadata | FolderMetadata, linkKeyEncrypted: string})} param0
     * @param {string} param0.uuid
     * @param {string} param0.linkUUID
     * @param {*} param0.metadata
     * @param {string} param0.linkKeyEncrypted
     * @returns {Promise<void>}
     */
    private renamePubliclyLinkedItem;
    /**
     * Checks if an item is shared or public linked.
     * If so, it renames the item.
     * @date 2/17/2024 - 4:37:30 AM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		itemMetadata: FileMetadata | FolderMetadata
     * 	}} param0
     * @param {string} param0.uuid
     * @param {*} param0.itemMetadata
     * @returns {Promise<void>}
     */
    checkIfItemIsSharedForRename({ uuid, itemMetadata }: {
        uuid: string;
        itemMetadata: FileMetadata | FolderMetadata;
    }): Promise<void>;
    /**
     * Fetch directory size in bytes, including file and folder count.
     * @date 2/20/2024 - 9:21:16 PM
     *
     * @public
     * @async
     * @param {{uuid: string, sharerId?: number, receiverId?: number, trash?: boolean}} param0
     * @param {string} param0.uuid
     * @param {number} param0.sharerId
     * @param {number} param0.receiverId
     * @param {boolean} param0.trash
     * @returns {Promise<{ size: number; folders: number; files: number }>}
     */
    directorySize({ uuid, sharerId, receiverId, trash }: {
        uuid: string;
        sharerId?: number;
        receiverId?: number;
        trash?: boolean;
    }): Promise<{
        size: number;
        folders: number;
        files: number;
    }>;
    /**
     * Fetch size of a directory inside a public link in bytes, including file and folder count.
     * @date 2/20/2024 - 9:21:53 PM
     *
     * @public
     * @async
     * @param {{uuid: string, linkUUID: string}} param0
     * @param {string} param0.uuid
     * @param {string} param0.linkUUID
     * @returns {Promise<{ size: number, folders: number, files: number }>}
     */
    directorySizePublicLink({ uuid, linkUUID }: {
        uuid: string;
        linkUUID: string;
    }): Promise<{
        size: number;
        folders: number;
        files: number;
    }>;
    /**
     * Download a file to a local path. Only works in a Node.JS environment.
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
     * 		end?: number
     * 		start?: number
     * 		to?: string
     * 		onProgress?: ProgressCallback
     * 		onProgressId?: string
     * 		onQueued?: () => void
     * 		onStarted?: () => void
     * 		onError?: (err: Error) => void
     * 		onFinished?: () => void
     * 		size: number
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.bucket
     * @param {string} param0.region
     * @param {number} param0.chunks
     * @param {FileEncryptionVersion} param0.version
     * @param {string} param0.key
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {number} param0.start
     * @param {number} param0.end
     * @param {string} param0.to
     * @param {ProgressCallback} param0.onProgress
     * @param {string} param0.onProgressId
     * @param {() => void} param0.onQueued
     * @param {() => void} param0.onStarted
     * @param {(err: Error) => void} param0.onError
     * @param {() => void} param0.onFinished
     * @param {number} param0.size
     * @returns {Promise<string>}
     */
    downloadFileToLocal({ uuid, bucket, region, chunks, version, key, abortSignal, pauseSignal, start, end, to, onProgress, onProgressId, onQueued, onStarted, onError, onFinished, size }: {
        uuid: string;
        bucket: string;
        region: string;
        chunks: number;
        version: FileEncryptionVersion;
        key: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        end?: number;
        start?: number;
        to?: string;
        onProgress?: ProgressCallback;
        onProgressId?: string;
        onQueued?: () => void;
        onStarted?: () => void;
        onError?: (err: Error) => void;
        onFinished?: () => void;
        size: number;
    }): Promise<string>;
    /**
     * Download a file to a ReadableStream.
     *
     * @public
     * @param {{
     * 		uuid: string
     * 		bucket: string
     * 		region: string
     * 		version: FileEncryptionVersion
     * 		key: string
     * 		size: number
     * 		chunks: number
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		start?: number
     * 		end?: number
     * 		onProgress?: ProgressCallback
     * 		onProgressId?: string
     * 		onQueued?: () => void
     * 		onStarted?: () => void
     * 		onError?: (err: Error) => void
     * 		onFinished?: () => void
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.bucket
     * @param {string} param0.region
     * @param {FileEncryptionVersion} param0.version
     * @param {string} param0.key
     * @param {number} param0.size
     * @param {number} param0.chunks
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {number} param0.start
     * @param {number} param0.end
     * @param {ProgressCallback} param0.onProgress
     * @param {string} param0.onProgressId
     * @param {() => void} param0.onQueued
     * @param {() => void} param0.onStarted
     * @param {(err: Error) => void} param0.onError
     * @param {() => void} param0.onFinished
     * @returns {ReadableStream<Buffer>}
     */
    downloadFileToReadableStream({ uuid, bucket, region, version, key, size, chunks, abortSignal, pauseSignal, start, end, onProgress, onProgressId, onQueued, onStarted, onError, onFinished }: {
        uuid: string;
        bucket: string;
        region: string;
        version: FileEncryptionVersion;
        key: string;
        size: number;
        chunks: number;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        start?: number;
        end?: number;
        onProgress?: ProgressCallback;
        onProgressId?: string;
        onQueued?: () => void;
        onStarted?: () => void;
        onError?: (err: Error) => void;
        onFinished?: () => void;
    }): ReadableStream<Buffer>;
    /**
     * Build a recursive directory tree which includes sub-directories and sub-files.
     * @date 2/22/2024 - 1:45:28 AM
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
     * @returns {Promise<Record<string, CloudItemTree>>}
     */
    getDirectoryTree({ uuid, type, linkUUID, linkHasPassword, linkPassword, linkSalt, skipCache, linkKey }: {
        uuid: string;
        type?: DirDownloadType;
        linkUUID?: string;
        linkHasPassword?: boolean;
        linkPassword?: string;
        linkSalt?: string;
        skipCache?: boolean;
        linkKey?: string;
    }): Promise<Record<string, CloudItemTree>>;
    /**
     * Download a directory to path. Only available in a Node.JS environment.
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
     * 		linkKey?: string
     * 		to?: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 		onProgressId?: string
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
     * @param {ProgressCallback} param0.onProgress
     * @param {string} param0.onProgressId
     * @param {string} param0.linkKey
     * @returns {Promise<string>}
     */
    downloadDirectoryToLocal({ uuid, type, linkUUID, linkHasPassword, linkPassword, linkSalt, to, abortSignal, pauseSignal, onQueued, onStarted, onError, onFinished, onProgress, onProgressId, linkKey }: {
        uuid: string;
        type?: DirDownloadType;
        linkUUID?: string;
        linkHasPassword?: boolean;
        linkPassword?: string;
        linkSalt?: string;
        linkKey?: string;
        to?: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        onProgress?: ProgressCallback;
        onProgressId?: string;
        onQueued?: () => void;
        onStarted?: () => void;
        onError?: (err: Error) => void;
        onFinished?: () => void;
    }): Promise<string>;
    /**
     * Upload a local file. Only available in a Node.JS environment.
     *
     * @public
     * @async
     * @param {{
     * 		source: string
     * 		parent: string
     * 		name?: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 		onProgressId?: string
     * 		onQueued?: () => void
     * 		onStarted?: () => void
     * 		onError?: (err: Error) => void
     * 		onFinished?: () => void
     * 		onUploaded?: (item: CloudItem) => Promise<void>
     * 	}} param0
     * @param {string} param0.source
     * @param {string} param0.parent
     * @param {string} param0.name
     * @param {PauseSignal} param0.pauseSignal
     * @param {AbortSignal} param0.abortSignal
     * @param {ProgressCallback} param0.onProgress
     * @param {string} param0.onProgressId
     * @param {() => void} param0.onQueued
     * @param {() => void} param0.onStarted
     * @param {(err: Error) => void} param0.onError
     * @param {() => void} param0.onFinished
     * @param {(item: CloudItem) => Promise<void>} param0.onUploaded
     * @returns {Promise<CloudItem>}
     */
    uploadLocalFile({ source, parent, name, pauseSignal, abortSignal, onProgress, onProgressId, onQueued, onStarted, onError, onFinished, onUploaded }: {
        source: string;
        parent: string;
        name?: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        onProgress?: ProgressCallback;
        onProgressId?: string;
        onQueued?: () => void;
        onStarted?: () => void;
        onError?: (err: Error) => void;
        onFinished?: () => void;
        onUploaded?: (item: CloudItem) => Promise<void>;
    }): Promise<CloudItem>;
    /**
     * Upload a file using Node.JS streams. It's not as fast as the normal uploadFile function since it's not completely multithreaded.
     * Only available in a Node.JS environment.
     * @public
     * @async
     * @param {{
     * 		source: NodeJS.ReadableStream
     * 		parent: string
     * 		name: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 		onProgressId?: string
     * 		onQueued?: () => void
     * 		onStarted?: () => void
     * 		onError?: (err: Error) => void
     * 		onFinished?: () => void
     * 		onUploaded?: (item: CloudItem) => Promise<void>
     * 		lastModified?: number
     * 		creation?: number
     * 	}} param0
     * @param {NodeJS.ReadableStream} param0.source
     * @param {string} param0.parent
     * @param {string} param0.name
     * @param {PauseSignal} param0.pauseSignal
     * @param {AbortSignal} param0.abortSignal
     * @param {ProgressCallback} param0.onProgress
     * @param {string} param0.onProgressId
     * @param {() => void} param0.onQueued
     * @param {() => void} param0.onStarted
     * @param {(err: Error) => void} param0.onError
     * @param {() => void} param0.onFinished
     * @param {(item: CloudItem) => Promise<void>} param0.onUploaded
     * @param {number} param0.lastModified
     * @param {number} param0.creation
     * @returns {Promise<CloudItem>}
     */
    uploadLocalFileStream({ source, parent, name, pauseSignal, abortSignal, onProgress, onProgressId, onQueued, onStarted, onError, onFinished, onUploaded, lastModified, creation }: {
        source: NodeJS.ReadableStream;
        parent: string;
        name: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        onProgress?: ProgressCallback;
        onProgressId?: string;
        onQueued?: () => void;
        onStarted?: () => void;
        onError?: (err: Error) => void;
        onFinished?: () => void;
        onUploaded?: (item: CloudItem) => Promise<void>;
        lastModified?: number;
        creation?: number;
    }): Promise<CloudItem>;
    /**
     * Upload a web-based file, such as from an <input /> field. Only works in a browser environment.
     *
     * @public
     * @async
     * @param {{
     * 		file: File
     * 		parent: string
     * 		name?: string
     * 		uuid?: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 		onProgressId?: string
     * 		onQueued?: () => void
     * 		onStarted?: () => void
     * 		onError?: (err: Error) => void
     * 		onFinished?: () => void
     * 		onUploaded?: (item: CloudItem) => Promise<void>
     * 	}} param0
     * @param {File} param0.file
     * @param {string} param0.parent
     * @param {string} param0.name
     * @param {string} param0.uuid
     * @param {PauseSignal} param0.pauseSignal
     * @param {AbortSignal} param0.abortSignal
     * @param {ProgressCallback} param0.onProgress
     * @param {string} param0.onProgressId
     * @param {() => void} param0.onQueued
     * @param {() => void} param0.onStarted
     * @param {(err: Error) => void} param0.onError
     * @param {() => void} param0.onFinished
     * @param {(item: CloudItem) => Promise<void>} param0.onUploaded
     * @returns {Promise<CloudItem>}
     */
    uploadWebFile({ file, parent, name, uuid, pauseSignal, abortSignal, onProgress, onProgressId, onQueued, onStarted, onError, onFinished, onUploaded }: {
        file: File;
        parent: string;
        name?: string;
        uuid?: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        onProgress?: ProgressCallback;
        onProgressId?: string;
        onQueued?: () => void;
        onStarted?: () => void;
        onError?: (err: Error) => void;
        onFinished?: () => void;
        onUploaded?: (item: CloudItem) => Promise<void>;
    }): Promise<CloudItem>;
    /**
     * Upload a local file at path. Only works in a Node.JS environment.
     *
     * @public
     * @async
     * @param {{
     * 		source: string
     * 		parent: string
     * 		name?: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 		onProgressId?: string
     * 		onQueued?: () => void
     * 		onStarted?: () => void
     * 		onError?: (err: Error) => void
     * 		onFinished?: () => void
     * 		onUploaded?: (item: CloudItem) => Promise<void>
     * 		onDirectoryCreated?: (item: CloudItem) => void,
     * 		throwOnSingleFileUploadError?: boolean
     * 	}} param0
     * @param {string} param0.source
     * @param {string} param0.parent
     * @param {string} param0.name
     * @param {PauseSignal} param0.pauseSignal
     * @param {AbortSignal} param0.abortSignal
     * @param {ProgressCallback} param0.onProgress
     * @param {string} param0.onProgressId
     * @param {() => void} param0.onQueued
     * @param {() => void} param0.onStarted
     * @param {(err: Error) => void} param0.onError
     * @param {() => void} param0.onFinished
     * @param {(item: CloudItem) => Promise<void>} param0.onUploaded
     * @param {(item: CloudItem) => void} param0.onDirectoryCreated
     * @param {boolean} param0.throwOnSingleFileUploadError
     * @returns {Promise<void>}
     */
    uploadLocalDirectory({ source, parent, name, pauseSignal, abortSignal, onProgress, onProgressId, onQueued, onStarted, onError, onFinished, onUploaded, onDirectoryCreated, throwOnSingleFileUploadError }: {
        source: string;
        parent: string;
        name?: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        onProgress?: ProgressCallback;
        onProgressId?: string;
        onQueued?: () => void;
        onStarted?: () => void;
        onError?: (err: Error) => void;
        onFinished?: () => void;
        onUploaded?: (item: CloudItem) => Promise<void>;
        onDirectoryCreated?: (item: CloudItem) => void;
        throwOnSingleFileUploadError?: boolean;
    }): Promise<void>;
    /**
     * Upload a web-based directory, such as from an <input /> field. Only works in a browser environment.
     *
     * @public
     * @async
     * @param {{
     * 		files: { file: File; path: string }[]
     * 		parent: string
     * 		name?: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 		onProgressId?: string
     * 		onQueued?: () => void
     * 		onStarted?: () => void
     * 		onError?: (err: Error) => void
     * 		onFinished?: () => void
     * 		onUploaded?: (item: CloudItem) => Promise<void>
     * 		onDirectoryCreated?: (item: CloudItem) => void
     * 		throwOnSingleFileUploadError?: boolean
     * 	}} param0
     * @param {{}} param0.files
     * @param {string} param0.parent
     * @param {string} param0.name
     * @param {PauseSignal} param0.pauseSignal
     * @param {AbortSignal} param0.abortSignal
     * @param {ProgressCallback} param0.onProgress
     * @param {string} param0.onProgressId
     * @param {() => void} param0.onQueued
     * @param {() => void} param0.onStarted
     * @param {(err: Error) => void} param0.onError
     * @param {() => void} param0.onFinished
     * @param {(item: CloudItem) => Promise<void>} param0.onUploaded
     * @param {(item: CloudItem) => void} param0.onDirectoryCreated
     * @param {boolean} param0.throwOnSingleFileUploadError
     * @returns {Promise<void>}
     */
    uploadDirectoryFromWeb({ files, parent, name, pauseSignal, abortSignal, onProgress, onProgressId, onQueued, onStarted, onError, onFinished, onUploaded, onDirectoryCreated, throwOnSingleFileUploadError }: {
        files: {
            file: File;
            path: string;
        }[];
        parent: string;
        name?: string;
        abortSignal?: AbortSignal;
        pauseSignal?: PauseSignal;
        onProgress?: ProgressCallback;
        onProgressId?: string;
        onQueued?: () => void;
        onStarted?: () => void;
        onError?: (err: Error) => void;
        onFinished?: () => void;
        onUploaded?: (item: CloudItem) => Promise<void>;
        onDirectoryCreated?: (item: CloudItem) => void;
        throwOnSingleFileUploadError?: boolean;
    }): Promise<void>;
    /**
     * Empty the trash.
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    emptyTrash(): Promise<void>;
    /**
     * Recursively find the full path of a file using it's UUID.
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<string>}
     */
    fileUUIDToPath({ uuid }: {
        uuid: string;
    }): Promise<string>;
    /**
     * Recursively find the full path of a file using it's UUID.
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<string>}
     */
    directoryUUIDToPath({ uuid }: {
        uuid: string;
    }): Promise<string>;
    /**
     * Get info about a file and decrypt its metadata.
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<GetFileResult>}
     */
    getFile({ uuid }: {
        uuid: string;
    }): Promise<GetFileResult>;
    /**
     * Get info about a directory and decrypt its metadata.
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<GetDirResult>}
     */
    getDirectory({ uuid }: {
        uuid: string;
    }): Promise<GetDirResult>;
}
export default Cloud;
