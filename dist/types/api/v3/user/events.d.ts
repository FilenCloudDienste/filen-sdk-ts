import type APIClient from "../../client";
import { type FileMetadata, type FolderMetadata } from "../../../types";
export type UserEventInfoBase = {
    ip: string;
    userAgent: string;
};
export type UserEventBase = {
    id: number;
    timestamp: number;
    uuid: string;
};
export type UserEvent = UserEventBase & ({
    type: "fileUploaded";
    info: UserEventInfoBase & {
        metadata: string;
        metadataDecrypted: FileMetadata;
    };
} | {
    type: "fileVersioned";
    info: UserEventInfoBase & {
        metadata: string;
        metadataDecrypted: FileMetadata;
    };
} | {
    type: "fileRestored";
    info: UserEventInfoBase & {
        metadata: string;
        metadataDecrypted: FileMetadata;
    };
} | {
    type: "versionedFileRestored";
    info: UserEventInfoBase & {
        metadata: string;
        metadataDecrypted: FileMetadata;
    };
} | {
    type: "fileMoved";
    info: UserEventInfoBase & {
        metadata: string;
        metadataDecrypted: FileMetadata;
    };
} | {
    type: "fileRenamed";
    info: UserEventInfoBase & {
        metadata: string;
        metadataDecrypted: FileMetadata;
        oldMetadata: string;
        oldMetadataDecrypted: FileMetadata;
    };
} | {
    type: "fileTrash";
    info: UserEventInfoBase & {
        metadata: string;
        metadataDecrypted: FileMetadata;
    };
} | {
    type: "fileRm";
    info: UserEventInfoBase & {
        metadata: string;
        metadataDecrypted: FileMetadata;
    };
} | {
    type: "fileShared";
    info: UserEventInfoBase & {
        metadata: string;
        metadataDecrypted: FileMetadata;
        receiverEmail: string;
    };
} | {
    type: "fileLinkEdited";
    info: UserEventInfoBase & {
        metadata: string;
        metadataDecrypted: FileMetadata;
    };
} | {
    type: "folderTrash";
    info: UserEventInfoBase & {
        name: string;
        nameDecrypted: FolderMetadata;
    };
} | {
    type: "folderShared";
    info: UserEventInfoBase & {
        name: string;
        nameDecrypted: FolderMetadata;
        receiverEmail: string;
    };
} | {
    type: "folderMoved";
    info: UserEventInfoBase & {
        name: string;
        nameDecrypted: FolderMetadata;
    };
} | {
    type: "folderRenamed";
    info: UserEventInfoBase & {
        name: string;
        nameDecrypted: FolderMetadata;
        oldName: string;
        oldNameDecrypted: FolderMetadata;
    };
} | {
    type: "subFolderCreated";
    info: UserEventInfoBase & {
        name: string;
        nameDecrypted: FolderMetadata;
    };
} | {
    type: "baseFolderCreated";
    info: UserEventInfoBase & {
        name: string;
        nameDecrypted: FolderMetadata;
    };
} | {
    type: "folderRestored";
    info: UserEventInfoBase & {
        name: string;
        nameDecrypted: FolderMetadata;
    };
} | {
    type: "folderColorChanged";
    info: UserEventInfoBase & {
        name: string;
        nameDecrypted: FolderMetadata;
    };
} | {
    type: "login";
    info: UserEventInfoBase;
} | {
    type: "deleteVersioned";
    info: UserEventInfoBase;
} | {
    type: "deleteAll";
    info: UserEventInfoBase;
} | {
    type: "deleteUnfinished";
    info: UserEventInfoBase;
} | {
    type: "trashEmptied";
    info: UserEventInfoBase;
} | {
    type: "requestAccountDeletion";
    info: UserEventInfoBase;
} | {
    type: "2faEnabled";
    info: UserEventInfoBase;
} | {
    type: "2faDisabled";
    info: UserEventInfoBase;
} | {
    type: "codeRedeemed";
    info: UserEventInfoBase & {
        code: string;
    };
} | {
    type: "emailChanged";
    info: UserEventInfoBase & {
        email: string;
    };
} | {
    type: "passwordChanged";
    info: UserEventInfoBase;
} | {
    type: "removedSharedInItems";
    info: UserEventInfoBase & {
        count: number;
        sharerEmail: string;
    };
} | {
    type: "removedSharedOutItems";
    info: UserEventInfoBase & {
        count: number;
        receiverEmail: string;
    };
} | {
    type: "folderLinkEdited";
    info: UserEventInfoBase & {
        linkUUID: string;
    };
} | {
    type: "itemFavorite";
    info: UserEventInfoBase & {
        value: 0 | 1;
        metadata: string;
        metadataDecrypted: FileMetadata | null;
        nameDecrypted: FolderMetadata | null;
    };
} | {
    type: "failedLogin";
    info: UserEventInfoBase;
} | {
    type: "deleteFolderPermanently";
    info: UserEventInfoBase & {
        name: string;
        nameDecrypted: FolderMetadata;
    };
} | {
    type: "deleteFilePermanently";
    info: UserEventInfoBase & {
        metadata: string;
        metadataDecrypted: FileMetadata;
    };
} | {
    type: "emailChangeAttempt";
    info: UserEventBase & {
        email: string;
        newEmail: string;
        oldEmail: string;
    };
});
export type UserEventsResponse = {
    events: UserEvent[];
};
/**
 * UserEvents
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserEvents
 * @typedef {UserEvents}
 */
export declare class UserEvents {
    private readonly apiClient;
    /**
     * Creates an instance of UserEvents.
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
     * Get user account events.
     * @date 2/20/2024 - 7:09:44 AM
     *
     * @public
     * @async
     * @param {{
     * 		lastTimestamp: number
     * 		filter: string
     * 	}} param0
     * @param {number} param0.lastTimestamp
     * @param {string} param0.filter
     * @returns {Promise<UserEvent[]>}
     */
    fetch({ lastTimestamp, filter }: {
        lastTimestamp: number;
        filter: string;
    }): Promise<UserEvent[]>;
}
export default UserEvents;
