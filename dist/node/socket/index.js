"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = exports.SOCKET_DEFAULTS = void 0;
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const events_1 = require("events");
exports.SOCKET_DEFAULTS = {
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
class Socket extends events_1.EventEmitter {
    /**
     * Creates an instance of Socket.
     * @date 3/1/2024 - 6:53:53 PM
     *
     * @constructor
     * @public
     */
    constructor() {
        super();
        this.socket = null;
        this.pingInterval = 0;
        this.apiKey = "";
        this.emitSocketAuthed = false;
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
        this.apiKey = apiKey;
        if (this.socket) {
            return;
        }
        this.socket = (0, socket_io_client_1.default)(exports.SOCKET_DEFAULTS.url, {
            path: "",
            reconnect: true,
            reconnection: true,
            transports: ["websocket"],
            upgrade: false
        });
        this.socket.on("connect", async () => {
            var _a;
            this.emit("connected");
            (_a = this.socket) === null || _a === void 0 ? void 0 : _a.emit("authed", Date.now());
            this.pingInterval = setInterval(() => {
                var _a;
                (_a = this.socket) === null || _a === void 0 ? void 0 : _a.emit("authed", Date.now());
            }, 15000);
        });
        this.socket.on("authFailed", () => {
            this.emit("autFailed");
        });
        this.socket.on("authed", async (authed) => {
            var _a;
            if (!authed) {
                (_a = this.socket) === null || _a === void 0 ? void 0 : _a.emit("auth", {
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
        this.socket.on("file-rename", (data) => {
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
        this.socket.on("file-new", (data) => {
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
        this.socket.on("file-trash", (data) => {
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
        this.socket.on("folder-rename", (data) => {
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
        this.socket.on("folder-move", (data) => {
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
        this.socket.on("folder-restore", (data) => {
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
        this.socket.on("trash-empty", () => {
            this.emit("socketEvent", {
                type: "trashEmpty"
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
        if (!this.socket || !this.socket.disconnected) {
            return false;
        }
        return this.socket.connected;
    }
}
exports.Socket = Socket;
exports.default = Socket;
//# sourceMappingURL=index.js.map