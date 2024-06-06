import io from "socket.io-client";
import { EventEmitter } from "events";
export const SOCKET_DEFAULTS = {
    url: "https://socket.filen.io"
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
export class Socket extends EventEmitter {
    socket = null;
    pingInterval = 0;
    apiKey = "";
    emitSocketAuthed = false;
    /**
     * Creates an instance of Socket.
     * @date 3/1/2024 - 6:53:53 PM
     *
     * @constructor
     * @public
     */
    constructor() {
        super();
    }
    /**
     * Connect to the realtime socket gateway.
     * @date 3/1/2024 - 6:53:57 PM
     *
     * @public
     * @param {{ apiKey: string }} param0
     * @param {string} param0.apiKey
     */
    connect({ apiKey }) {
        if (this.socket || this.isConnected() || apiKey.length < 32 || apiKey === "anonymous") {
            return;
        }
        this.apiKey = apiKey;
        this.socket = null;
        this.socket = io(SOCKET_DEFAULTS.url, {
            path: "",
            reconnect: true,
            reconnection: true,
            transports: ["websocket"],
            upgrade: false
        });
        this.socket.on("connect", async () => {
            this.emit("connected");
            this.socket?.emit("auth", {
                apiKey: this.apiKey
            });
            this.emitSocketAuthed = true;
            this.socket?.emit("authed", Date.now());
            this.pingInterval = setInterval(() => {
                this.socket?.emit("authed", Date.now());
            }, 15000);
        });
        this.socket.on("authFailed", () => {
            this.emit("autFailed");
        });
        this.socket.on("authed", async (authed) => {
            if (!authed) {
                this.socket?.emit("auth", {
                    apiKey: this.apiKey
                });
                this.emitSocketAuthed = true;
            }
            else {
                if (this.emitSocketAuthed) {
                    this.emitSocketAuthed = false;
                    this.emit("socketAuthed");
                }
            }
        });
        this.socket.on("disconnect", () => {
            this.emit("disconnected");
            clearInterval(this.pingInterval);
        });
        this.socket.on("new-event", (data) => {
            this.emit("socketEvent", {
                type: "newEvent",
                data
            });
        });
        this.socket.on("newEvent", (data) => {
            this.emit("socketEvent", {
                type: "newEvent",
                data
            });
        });
        this.socket.on("file-rename", (data) => {
            this.emit("socketEvent", {
                type: "fileRename",
                data
            });
        });
        this.socket.on("fileRename", (data) => {
            this.emit("socketEvent", {
                type: "fileRename",
                data
            });
        });
        this.socket.on("file-archive-restored", (data) => {
            this.emit("socketEvent", {
                type: "fileArchiveRestored",
                data
            });
        });
        this.socket.on("fileArchiveRestored", (data) => {
            this.emit("socketEvent", {
                type: "fileArchiveRestored",
                data
            });
        });
        this.socket.on("file-new", (data) => {
            this.emit("socketEvent", {
                type: "fileNew",
                data
            });
        });
        this.socket.on("fileNew", (data) => {
            this.emit("socketEvent", {
                type: "fileNew",
                data
            });
        });
        this.socket.on("file-move", (data) => {
            this.emit("socketEvent", {
                type: "fileMove",
                data
            });
        });
        this.socket.on("fileMove", (data) => {
            this.emit("socketEvent", {
                type: "fileMove",
                data
            });
        });
        this.socket.on("file-trash", (data) => {
            this.emit("socketEvent", {
                type: "fileTrash",
                data
            });
        });
        this.socket.on("fileTrash", (data) => {
            this.emit("socketEvent", {
                type: "fileTrash",
                data
            });
        });
        this.socket.on("file-archived", (data) => {
            this.emit("socketEvent", {
                type: "fileArchived",
                data
            });
        });
        this.socket.on("fileArchived", (data) => {
            this.emit("socketEvent", {
                type: "fileArchived",
                data
            });
        });
        this.socket.on("folder-rename", (data) => {
            this.emit("socketEvent", {
                type: "folderRename",
                data
            });
        });
        this.socket.on("folderRename", (data) => {
            this.emit("socketEvent", {
                type: "folderRename",
                data
            });
        });
        this.socket.on("folder-trash", (data) => {
            this.emit("socketEvent", {
                type: "folderTrash",
                data
            });
        });
        this.socket.on("folderTrash", (data) => {
            this.emit("socketEvent", {
                type: "folderTrash",
                data
            });
        });
        this.socket.on("folder-move", (data) => {
            this.emit("socketEvent", {
                type: "folderMove",
                data
            });
        });
        this.socket.on("folderMove", (data) => {
            this.emit("socketEvent", {
                type: "folderMove",
                data
            });
        });
        this.socket.on("folder-sub-created", (data) => {
            this.emit("socketEvent", {
                type: "folderSubCreated",
                data
            });
        });
        this.socket.on("folderSubCreated", (data) => {
            this.emit("socketEvent", {
                type: "folderSubCreated",
                data
            });
        });
        this.socket.on("folder-restore", (data) => {
            this.emit("socketEvent", {
                type: "folderRestore",
                data
            });
        });
        this.socket.on("folderRestore", (data) => {
            this.emit("socketEvent", {
                type: "folderRestore",
                data
            });
        });
        this.socket.on("folder-color-changed", (data) => {
            this.emit("socketEvent", {
                type: "folderColorChanged",
                data
            });
        });
        this.socket.on("folderColorChanged", (data) => {
            this.emit("socketEvent", {
                type: "folderColorChanged",
                data
            });
        });
        this.socket.on("trash-empty", () => {
            this.emit("socketEvent", {
                type: "trashEmpty"
            });
        });
        this.socket.on("trashEmpty", () => {
            this.emit("socketEvent", {
                type: "trashEmpty"
            });
        });
        this.socket.on("passwordChanged", () => {
            this.emit("socketEvent", {
                type: "passwordChanged"
            });
        });
        this.socket.on("chatMessageNew", (data) => {
            this.emit("socketEvent", {
                type: "chatMessageNew",
                data
            });
        });
        this.socket.on("chatTyping", (data) => {
            this.emit("socketEvent", {
                type: "chatTyping",
                data
            });
        });
        this.socket.on("chatMessageDelete", (data) => {
            this.emit("socketEvent", {
                type: "chatMessageDelete",
                data
            });
        });
        this.socket.on("chatMessageEmbedDisabled", (data) => {
            this.emit("socketEvent", {
                type: "chatMessageEmbedDisabled",
                data
            });
        });
        this.socket.on("noteContentEdited", (data) => {
            this.emit("socketEvent", {
                type: "noteContentEdited",
                data
            });
        });
        this.socket.on("noteArchived", (data) => {
            this.emit("socketEvent", {
                type: "noteArchived",
                data
            });
        });
        this.socket.on("noteDeleted", (data) => {
            this.emit("socketEvent", {
                type: "noteDeleted",
                data
            });
        });
        this.socket.on("noteTitleEdited", (data) => {
            this.emit("socketEvent", {
                type: "noteTitleEdited",
                data
            });
        });
        this.socket.on("noteParticipantPermissions", (data) => {
            this.emit("socketEvent", {
                type: "noteParticipantPermissions",
                data
            });
        });
        this.socket.on("noteRestored", (data) => {
            this.emit("socketEvent", {
                type: "noteRestored",
                data
            });
        });
        this.socket.on("noteParticipantRemoved", (data) => {
            this.emit("socketEvent", {
                type: "noteParticipantRemoved",
                data
            });
        });
        this.socket.on("noteParticipantNew", (data) => {
            this.emit("socketEvent", {
                type: "noteParticipantNew",
                data
            });
        });
        this.socket.on("noteNew", (data) => {
            this.emit("socketEvent", {
                type: "noteNew",
                data
            });
        });
        this.socket.on("chatMessageEdited", (data) => {
            this.emit("socketEvent", {
                type: "chatMessageEdited",
                data
            });
        });
        this.socket.on("chatConversationNameEdited", (data) => {
            this.emit("socketEvent", {
                type: "chatConversationNameEdited",
                data
            });
        });
        this.socket.on("chatConversationDeleted", (data) => {
            this.emit("socketEvent", {
                type: "chatConversationDeleted",
                data
            });
        });
        this.socket.on("chatConversationParticipantLeft", (data) => {
            this.emit("socketEvent", {
                type: "chatConversationParticipantLeft",
                data
            });
        });
        this.socket.on("chatConversationsNew", (data) => {
            this.emit("socketEvent", {
                type: "chatConversationsNew",
                data
            });
        });
        this.socket.on("file-restore", (data) => {
            this.emit("socketEvent", {
                type: "fileRestore",
                data
            });
        });
        this.socket.on("fileRestore", (data) => {
            this.emit("socketEvent", {
                type: "fileRestore",
                data
            });
        });
        this.socket.on("contactRequestReceived", (data) => {
            this.emit("socketEvent", {
                type: "contactRequestReceived",
                data
            });
        });
        this.socket.on("item-favorite", (data) => {
            this.emit("socketEvent", {
                type: "itemFavorite",
                data
            });
        });
        this.socket.on("chatConversationParticipantNew", (data) => {
            this.emit("socketEvent", {
                type: "chatConversationParticipantNew",
                data
            });
        });
        this.socket.on("file-deleted-permanent", (data) => {
            this.emit("socketEvent", {
                type: "fileDeletedPermanent",
                data
            });
        });
    }
    /**
     * Disconnect from the realtime socket gateway.
     * @date 3/1/2024 - 6:54:17 PM
     *
     * @public
     */
    disconnect() {
        if (!this.socket) {
            return;
        }
        this.socket.disconnect();
    }
    /**
     * Check connection status.
     * @date 3/1/2024 - 6:54:29 PM
     *
     * @public
     * @returns {boolean}
     */
    isConnected() {
        if (!this.socket) {
            return false;
        }
        return this.socket.connected;
    }
}
export default Socket;
//# sourceMappingURL=index.js.map