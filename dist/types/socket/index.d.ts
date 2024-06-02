/// <reference types="node" />
import { EventEmitter } from "events";
import type { DirColors } from "../api/v3/dir/color";
import type { ChatMessage } from "../api/v3/chat/messages";
import type { NoteParticipant, NoteType } from "../api/v3/notes";
import type { ChatTypingType } from "../api/v3/chat/typing";
export declare const SOCKET_DEFAULTS: {
    url: string;
};
export interface SocketNewEvent {
    uuid: string;
    type: string;
    timestamp: number;
    info: {
        ip: string;
        metadata: string;
        userAgent: string;
        uuid: string;
    };
}
export interface SocketFileRename {
    uuid: string;
    metadata: string;
}
export interface SocketFileArchiveRestored {
    currentUUID: string;
    parent: string;
    uuid: string;
    metadata: string;
    rm: string;
    timestamp: number;
    chunks: number;
    bucket: string;
    region: string;
    version: number;
    favorited: 0 | 1;
}
export interface SocketFileNew {
    parent: string;
    uuid: string;
    metadata: string;
    rm: string;
    timestamp: number;
    chunks: number;
    bucket: string;
    region: string;
    version: number;
    favorited: 0 | 1;
}
export interface SocketFileRestore {
    parent: string;
    uuid: string;
    metadata: string;
    rm: string;
    timestamp: number;
    chunks: number;
    bucket: string;
    region: string;
    version: number;
    favorited: 0 | 1;
}
export interface SocketFileMove {
    parent: string;
    uuid: string;
    metadata: string;
    rm: string;
    timestamp: number;
    chunks: number;
    bucket: string;
    region: string;
    version: number;
    favorited: 0 | 1;
}
export interface SocketFileTrash {
    uuid: string;
}
export interface SocketFileArchived {
    uuid: string;
}
export interface SocketFolderRename {
    name: string;
    uuid: string;
}
export interface SocketFolderTrash {
    parent: string;
    uuid: string;
}
export interface SocketFolderMove {
    name: string;
    uuid: string;
    parent: string;
    timestamp: number;
    favorited: 0 | 1;
}
export interface SocketFolderSubCreated {
    name: string;
    uuid: string;
    parent: string;
    timestamp: number;
    favorited: 0 | 1;
}
export interface SocketFolderRestore {
    name: string;
    uuid: string;
    parent: string;
    timestamp: number;
    favorited: 0 | 1;
}
export interface SocketFolderColorChanged {
    uuid: string;
    color: DirColors;
}
export interface SocketChatMessageNew extends ChatMessage {
    conversation: string;
}
export interface SocketChatTyping {
    conversation: string;
    senderAvatar: string | null;
    senderEmail: string;
    senderNickName: string;
    senderId: number;
    timestamp: number;
    type: ChatTypingType;
}
export interface SocketChatConversationsNew {
    uuid: string;
    metadata: string;
    addedTimestamp: number;
}
export interface SocketChatMessageDelete {
    uuid: string;
}
export interface SocketNoteContentEdited {
    note: string;
    content: string;
    type: NoteType;
    editorId: number;
    editedTimestamp: number;
}
export interface SocketNoteArchived {
    note: string;
}
export interface SocketNoteDeleted {
    note: string;
}
export interface SocketNoteTitleEdited {
    note: string;
    title: string;
}
export interface SocketNoteParticipantPermissions {
    note: string;
    userId: number;
    permissionsWrite: boolean;
}
export interface SocketNoteRestored {
    note: string;
}
export interface SocketNoteParticipantRemoved {
    note: string;
    userId: number;
}
export interface SocketNoteParticipantNew extends NoteParticipant {
    note: string;
}
export interface SocketNoteNew {
    note: string;
}
export interface SocketChatMessageEmbedDisabled {
    uuid: string;
}
export interface SocketChatConversationParticipantLeft {
    uuid: string;
    userId: number;
}
export interface SocketChatConversationDeleted {
    uuid: string;
}
export interface SocketChatMessageEdited {
    conversation: string;
    uuid: string;
    message: string;
    editedTimestamp: number;
}
export interface SocketChatConversationNameEdited {
    uuid: string;
    name: string;
}
export interface SocketContactRequestReceived {
    uuid: string;
    senderId: number;
    senderEmail: string;
    senderAvatar: string | null;
    senderNickName: string | null;
    sentTimestamp: number;
}
export interface SocketItemFavorite {
    uuid: string;
    type: "file" | "folder";
    value: 0 | 1;
    metadata: string;
}
export interface SocketChatConversationParticipantNew {
    conversation: string;
    userId: number;
    email: string;
    avatar: string | null;
    nickName: string | null;
    metadata: string;
    permissionsAdd: boolean;
    addedTimestamp: number;
}
export interface SocketFileDeletedPermanent {
    uuid: string;
}
export type SocketEvent = {
    type: "newEvent";
    data: SocketNewEvent;
} | {
    type: "fileRename";
    data: SocketFileRename;
} | {
    type: "fileArchiveRestored";
    data: SocketFileArchiveRestored;
} | {
    type: "fileNew";
    data: SocketFileNew;
} | {
    type: "fileRestore";
    data: SocketFileRestore;
} | {
    type: "fileMove";
    data: SocketFileMove;
} | {
    type: "fileTrash";
    data: SocketFileTrash;
} | {
    type: "fileArchived";
    data: SocketFileArchived;
} | {
    type: "folderRename";
    data: SocketFolderRename;
} | {
    type: "folderTrash";
    data: SocketFolderTrash;
} | {
    type: "folderMove";
    data: SocketFolderMove;
} | {
    type: "folderSubCreated";
    data: SocketFolderSubCreated;
} | {
    type: "folderRestore";
    data: SocketFolderRestore;
} | {
    type: "folderColorChanged";
    data: SocketFolderColorChanged;
} | {
    type: "trashEmpty";
} | {
    type: "passwordChanged";
} | {
    type: "chatMessageNew";
    data: SocketChatMessageNew;
} | {
    type: "chatTyping";
    data: SocketChatTyping;
} | {
    type: "chatConversationsNew";
    data: SocketChatConversationsNew;
} | {
    type: "chatMessageDelete";
    data: SocketChatMessageDelete;
} | {
    type: "noteContentEdited";
    data: SocketNoteContentEdited;
} | {
    type: "noteArchived";
    data: SocketNoteArchived;
} | {
    type: "noteDeleted";
    data: SocketNoteDeleted;
} | {
    type: "noteTitleEdited";
    data: SocketNoteTitleEdited;
} | {
    type: "noteParticipantPermissions";
    data: SocketNoteParticipantPermissions;
} | {
    type: "noteRestored";
    data: SocketNoteRestored;
} | {
    type: "noteParticipantRemoved";
    data: SocketNoteParticipantRemoved;
} | {
    type: "noteParticipantNew";
    data: SocketNoteParticipantNew;
} | {
    type: "noteNew";
    data: SocketNoteNew;
} | {
    type: "chatMessageEmbedDisabled";
    data: SocketChatMessageEmbedDisabled;
} | {
    type: "chatConversationParticipantLeft";
    data: SocketChatConversationParticipantLeft;
} | {
    type: "chatConversationDeleted";
    data: SocketChatConversationDeleted;
} | {
    type: "chatMessageEdited";
    data: SocketChatMessageEdited;
} | {
    type: "chatConversationNameEdited";
    data: SocketChatConversationNameEdited;
} | {
    type: "contactRequestReceived";
    data: SocketContactRequestReceived;
} | {
    type: "itemFavorite";
    data: SocketItemFavorite;
} | {
    type: "chatConversationParticipantNew";
    data: SocketChatConversationParticipantNew;
} | {
    type: "fileDeletedPermanent";
    data: SocketFileDeletedPermanent;
};
/**
 * Socket
 * @date 3/1/2024 - 6:53:50 PM
 *
 * @export
 * @class Socket
 * @typedef {Socket}
 * @extends {EventEmitter}
 */
export declare class Socket extends EventEmitter {
    private socket;
    private pingInterval;
    private apiKey;
    private emitSocketAuthed;
    /**
     * Creates an instance of Socket.
     * @date 3/1/2024 - 6:53:53 PM
     *
     * @constructor
     * @public
     */
    constructor();
    /**
     * Connect to the realtime socket gateway.
     * @date 3/1/2024 - 6:53:57 PM
     *
     * @public
     * @param {{ apiKey: string }} param0
     * @param {string} param0.apiKey
     */
    connect({ apiKey }: {
        apiKey: string;
    }): void;
    /**
     * Disconnect from the realtime socket gateway.
     * @date 3/1/2024 - 6:54:17 PM
     *
     * @public
     */
    disconnect(): void;
    /**
     * Check connection status.
     * @date 3/1/2024 - 6:54:29 PM
     *
     * @public
     * @returns {boolean}
     */
    isConnected(): boolean;
}
export default Socket;
