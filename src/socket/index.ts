import io from "socket.io-client"
import { EventEmitter } from "events"
import { type DirColors } from "../api/v3/dir/color"
import { type ChatMessage } from "../api/v3/chat/messages"
import { type NoteParticipant, type NoteType } from "../api/v3/notes"
import { type ChatTypingType } from "../api/v3/chat/typing"

export const SOCKET_DEFAULTS = {
	url: "https://socket.filen.io"
}

export interface SocketNewEvent {
	uuid: string
	type: string
	timestamp: number
	info: {
		ip: string
		metadata: string
		userAgent: string
		uuid: string
	}
}

export interface SocketFileRename {
	uuid: string
	metadata: string
}

export interface SocketFileArchiveRestored {
	currentUUID: string
	parent: string
	uuid: string
	metadata: string
	rm: string
	timestamp: number
	chunks: number
	bucket: string
	region: string
	version: number
	favorited: 0 | 1
}

export interface SocketFileNew {
	parent: string
	uuid: string
	metadata: string
	rm: string
	timestamp: number
	chunks: number
	bucket: string
	region: string
	version: number
	favorited: 0 | 1
}

export interface SocketFileRestore {
	parent: string
	uuid: string
	metadata: string
	rm: string
	timestamp: number
	chunks: number
	bucket: string
	region: string
	version: number
	favorited: 0 | 1
}

export interface SocketFileMove {
	parent: string
	uuid: string
	metadata: string
	rm: string
	timestamp: number
	chunks: number
	bucket: string
	region: string
	version: number
	favorited: 0 | 1
}

export interface SocketFileTrash {
	uuid: string
}

export interface SocketFileArchived {
	uuid: string
}

export interface SocketFolderRename {
	name: string
	uuid: string
}

export interface SocketFolderTrash {
	parent: string
	uuid: string
}

export interface SocketFolderMove {
	name: string
	uuid: string
	parent: string
	timestamp: number
	favorited: 0 | 1
}

export interface SocketFolderSubCreated {
	name: string
	uuid: string
	parent: string
	timestamp: number
	favorited: 0 | 1
}

export interface SocketFolderRestore {
	name: string
	uuid: string
	parent: string
	timestamp: number
	favorited: 0 | 1
}

export interface SocketFolderColorChanged {
	uuid: string
	color: DirColors
}

export interface SocketChatMessageNew extends ChatMessage {
	conversation: string
}

export interface SocketChatTyping {
	conversation: string
	senderAvatar: string | null
	senderEmail: string
	senderNickName: string
	senderId: number
	timestamp: number
	type: ChatTypingType
}

export interface SocketChatConversationsNew {
	uuid: string
	metadata: string
	addedTimestamp: number
}

export interface SocketChatMessageDelete {
	uuid: string
}

export interface SocketNoteContentEdited {
	note: string
	content: string
	type: NoteType
	editorId: number
	editedTimestamp: number
}

export interface SocketNoteArchived {
	note: string
}

export interface SocketNoteDeleted {
	note: string
}

export interface SocketNoteTitleEdited {
	note: string
	title: string
}

export interface SocketNoteParticipantPermissions {
	note: string
	userId: number
	permissionsWrite: boolean
}

export interface SocketNoteRestored {
	note: string
}

export interface SocketNoteParticipantRemoved {
	note: string
	userId: number
}

export interface SocketNoteParticipantNew extends NoteParticipant {
	note: string
}

export interface SocketNoteNew {
	note: string
}

export interface SocketChatMessageEmbedDisabled {
	uuid: string
}

export interface SocketChatConversationParticipantLeft {
	uuid: string
	userId: number
}

export interface SocketChatConversationDeleted {
	uuid: string
}

export interface SocketChatMessageEdited {
	conversation: string
	uuid: string
	message: string
	editedTimestamp: number
}

export interface SocketChatConversationNameEdited {
	uuid: string
	name: string
}

export interface SocketContactRequestReceived {
	uuid: string
	senderId: number
	senderEmail: string
	senderAvatar: string | null
	senderNickName: string | null
	sentTimestamp: number
}

export interface SocketItemFavorite {
	uuid: string
	type: "file" | "folder"
	value: 0 | 1
	metadata: string
}

export interface SocketChatConversationParticipantNew {
	conversation: string
	userId: number
	email: string
	avatar: string | null
	nickName: string | null
	metadata: string
	permissionsAdd: boolean
	addedTimestamp: number
}

export interface SocketFileDeletedPermanent {
	uuid: string
}

export type SocketEvent =
	| {
			type: "newEvent"
			data: SocketNewEvent
	  }
	| {
			type: "fileRename"
			data: SocketFileRename
	  }
	| {
			type: "fileArchiveRestored"
			data: SocketFileArchiveRestored
	  }
	| {
			type: "fileNew"
			data: SocketFileNew
	  }
	| {
			type: "fileRestore"
			data: SocketFileRestore
	  }
	| {
			type: "fileMove"
			data: SocketFileMove
	  }
	| {
			type: "fileTrash"
			data: SocketFileTrash
	  }
	| {
			type: "fileArchived"
			data: SocketFileArchived
	  }
	| {
			type: "folderRename"
			data: SocketFolderRename
	  }
	| {
			type: "folderTrash"
			data: SocketFolderTrash
	  }
	| {
			type: "folderMove"
			data: SocketFolderMove
	  }
	| {
			type: "folderSubCreated"
			data: SocketFolderSubCreated
	  }
	| {
			type: "folderRestore"
			data: SocketFolderRestore
	  }
	| {
			type: "folderColorChanged"
			data: SocketFolderColorChanged
	  }
	| {
			type: "trashEmpty"
	  }
	| {
			type: "passwordChanged"
	  }
	| {
			type: "chatMessageNew"
			data: SocketChatMessageNew
	  }
	| {
			type: "chatTyping"
			data: SocketChatTyping
	  }
	| {
			type: "chatConversationsNew"
			data: SocketChatConversationsNew
	  }
	| {
			type: "chatMessageDelete"
			data: SocketChatMessageDelete
	  }
	| {
			type: "noteContentEdited"
			data: SocketNoteContentEdited
	  }
	| {
			type: "noteArchived"
			data: SocketNoteArchived
	  }
	| {
			type: "noteDeleted"
			data: SocketNoteDeleted
	  }
	| {
			type: "noteTitleEdited"
			data: SocketNoteTitleEdited
	  }
	| {
			type: "noteParticipantPermissions"
			data: SocketNoteParticipantPermissions
	  }
	| {
			type: "noteRestored"
			data: SocketNoteRestored
	  }
	| {
			type: "noteParticipantRemoved"
			data: SocketNoteParticipantRemoved
	  }
	| {
			type: "noteParticipantNew"
			data: SocketNoteParticipantNew
	  }
	| {
			type: "noteNew"
			data: SocketNoteNew
	  }
	| {
			type: "chatMessageEmbedDisabled"
			data: SocketChatMessageEmbedDisabled
	  }
	| {
			type: "chatConversationParticipantLeft"
			data: SocketChatConversationParticipantLeft
	  }
	| {
			type: "chatConversationDeleted"
			data: SocketChatConversationDeleted
	  }
	| {
			type: "chatMessageEdited"
			data: SocketChatMessageEdited
	  }
	| {
			type: "chatConversationNameEdited"
			data: SocketChatConversationNameEdited
	  }
	| {
			type: "contactRequestReceived"
			data: SocketContactRequestReceived
	  }
	| {
			type: "itemFavorite"
			data: SocketItemFavorite
	  }
	| {
			type: "chatConversationParticipantNew"
			data: SocketChatConversationParticipantNew
	  }
	| {
			type: "fileDeletedPermanent"
			data: SocketFileDeletedPermanent
	  }

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
	private socket: ReturnType<typeof io> | null = null
	private pingInterval: ReturnType<typeof setInterval> | number = 0
	private apiKey = ""
	private emitSocketAuthed = false
	private connected = false

	/**
	 * Creates an instance of Socket.
	 * @date 3/1/2024 - 6:53:53 PM
	 *
	 * @constructor
	 * @public
	 */
	public constructor() {
		super()
	}

	/**
	 * Connect to the realtime socket gateway.
	 * @date 3/1/2024 - 6:53:57 PM
	 *
	 * @public
	 * @param {{ apiKey: string }} param0
	 * @param {string} param0.apiKey
	 */
	public connect({ apiKey }: { apiKey: string }): void {
		if (this.socket || this.isConnected() || apiKey.length < 32 || apiKey === "anonymous") {
			return
		}

		clearInterval(this.pingInterval)

		this.connected = false
		this.apiKey = apiKey
		this.socket = null
		this.emitSocketAuthed = false
		this.socket = io(SOCKET_DEFAULTS.url, {
			path: "",
			reconnect: true,
			reconnection: true,
			transports: ["websocket"],
			upgrade: false
		})

		this.socket.on("connect", async () => {
			this.connected = true

			this.emit("connected")

			this.socket?.emit("auth", {
				apiKey: this.apiKey
			})

			this.emitSocketAuthed = true

			this.socket?.emit("authed", Date.now())

			this.pingInterval = setInterval(() => {
				this.socket?.emit("authed", Date.now())
			}, 15000)
		})

		this.socket.on("authFailed", () => {
			this.emit("autFailed")
		})

		this.socket.on("authed", async (authed: boolean) => {
			if (!authed) {
				this.socket?.emit("auth", {
					apiKey: this.apiKey
				})

				this.emitSocketAuthed = true
			} else {
				if (this.emitSocketAuthed) {
					this.emitSocketAuthed = false

					this.emit("socketAuthed")
				}
			}
		})

		this.socket.on("disconnect", () => {
			this.socket = null
			this.connected = false
			this.emitSocketAuthed = false

			clearInterval(this.pingInterval)

			this.emit("disconnected")
		})

		this.socket.on("new-event", (data: SocketNewEvent) => {
			this.emit("socketEvent", {
				type: "newEvent",
				data
			} as SocketEvent)
		})

		this.socket.on("newEvent", (data: SocketNewEvent) => {
			this.emit("socketEvent", {
				type: "newEvent",
				data
			} as SocketEvent)
		})

		this.socket.on("file-rename", (data: SocketFileRename) => {
			this.emit("socketEvent", {
				type: "fileRename",
				data
			} as SocketEvent)
		})

		this.socket.on("fileRename", (data: SocketFileRename) => {
			this.emit("socketEvent", {
				type: "fileRename",
				data
			} as SocketEvent)
		})

		this.socket.on("file-archive-restored", (data: SocketFileArchiveRestored) => {
			this.emit("socketEvent", {
				type: "fileArchiveRestored",
				data
			} as SocketEvent)
		})

		this.socket.on("fileArchiveRestored", (data: SocketFileArchiveRestored) => {
			this.emit("socketEvent", {
				type: "fileArchiveRestored",
				data
			} as SocketEvent)
		})

		this.socket.on("file-new", (data: SocketFileNew) => {
			this.emit("socketEvent", {
				type: "fileNew",
				data
			} as SocketEvent)
		})

		this.socket.on("fileNew", (data: SocketFileNew) => {
			this.emit("socketEvent", {
				type: "fileNew",
				data
			} as SocketEvent)
		})

		this.socket.on("file-move", (data: SocketFileMove) => {
			this.emit("socketEvent", {
				type: "fileMove",
				data
			} as SocketEvent)
		})

		this.socket.on("fileMove", (data: SocketFileMove) => {
			this.emit("socketEvent", {
				type: "fileMove",
				data
			} as SocketEvent)
		})

		this.socket.on("file-trash", (data: SocketFileTrash) => {
			this.emit("socketEvent", {
				type: "fileTrash",
				data
			} as SocketEvent)
		})

		this.socket.on("fileTrash", (data: SocketFileTrash) => {
			this.emit("socketEvent", {
				type: "fileTrash",
				data
			} as SocketEvent)
		})

		this.socket.on("file-archived", (data: SocketFileArchived) => {
			this.emit("socketEvent", {
				type: "fileArchived",
				data
			} as SocketEvent)
		})

		this.socket.on("fileArchived", (data: SocketFileArchived) => {
			this.emit("socketEvent", {
				type: "fileArchived",
				data
			} as SocketEvent)
		})

		this.socket.on("folder-rename", (data: SocketFolderRename) => {
			this.emit("socketEvent", {
				type: "folderRename",
				data
			} as SocketEvent)
		})

		this.socket.on("folderRename", (data: SocketFolderRename) => {
			this.emit("socketEvent", {
				type: "folderRename",
				data
			} as SocketEvent)
		})

		this.socket.on("folder-trash", (data: SocketFolderTrash) => {
			this.emit("socketEvent", {
				type: "folderTrash",
				data
			} as SocketEvent)
		})

		this.socket.on("folderTrash", (data: SocketFolderTrash) => {
			this.emit("socketEvent", {
				type: "folderTrash",
				data
			} as SocketEvent)
		})

		this.socket.on("folder-move", (data: SocketFolderMove) => {
			this.emit("socketEvent", {
				type: "folderMove",
				data
			} as SocketEvent)
		})

		this.socket.on("folderMove", (data: SocketFolderMove) => {
			this.emit("socketEvent", {
				type: "folderMove",
				data
			} as SocketEvent)
		})

		this.socket.on("folder-sub-created", (data: SocketFolderSubCreated) => {
			this.emit("socketEvent", {
				type: "folderSubCreated",
				data
			} as SocketEvent)
		})

		this.socket.on("folderSubCreated", (data: SocketFolderSubCreated) => {
			this.emit("socketEvent", {
				type: "folderSubCreated",
				data
			} as SocketEvent)
		})

		this.socket.on("folder-restore", (data: SocketFolderRestore) => {
			this.emit("socketEvent", {
				type: "folderRestore",
				data
			} as SocketEvent)
		})

		this.socket.on("folderRestore", (data: SocketFolderRestore) => {
			this.emit("socketEvent", {
				type: "folderRestore",
				data
			} as SocketEvent)
		})

		this.socket.on("folder-color-changed", (data: SocketFolderColorChanged) => {
			this.emit("socketEvent", {
				type: "folderColorChanged",
				data
			} as SocketEvent)
		})

		this.socket.on("folderColorChanged", (data: SocketFolderColorChanged) => {
			this.emit("socketEvent", {
				type: "folderColorChanged",
				data
			} as SocketEvent)
		})

		this.socket.on("trash-empty", () => {
			this.emit("socketEvent", {
				type: "trashEmpty"
			} as SocketEvent)
		})

		this.socket.on("trashEmpty", () => {
			this.emit("socketEvent", {
				type: "trashEmpty"
			} as SocketEvent)
		})

		this.socket.on("passwordChanged", () => {
			this.emit("socketEvent", {
				type: "passwordChanged"
			} as SocketEvent)
		})

		this.socket.on("chatMessageNew", (data: SocketChatMessageNew) => {
			this.emit("socketEvent", {
				type: "chatMessageNew",
				data
			} as SocketEvent)
		})

		this.socket.on("chatTyping", (data: SocketChatTyping) => {
			this.emit("socketEvent", {
				type: "chatTyping",
				data
			} as SocketEvent)
		})

		this.socket.on("chatMessageDelete", (data: SocketChatMessageDelete) => {
			this.emit("socketEvent", {
				type: "chatMessageDelete",
				data
			} as SocketEvent)
		})

		this.socket.on("chatMessageEmbedDisabled", (data: SocketChatMessageEmbedDisabled) => {
			this.emit("socketEvent", {
				type: "chatMessageEmbedDisabled",
				data
			} as SocketEvent)
		})

		this.socket.on("noteContentEdited", (data: SocketNoteContentEdited) => {
			this.emit("socketEvent", {
				type: "noteContentEdited",
				data
			} as SocketEvent)
		})

		this.socket.on("noteArchived", (data: SocketNoteArchived) => {
			this.emit("socketEvent", {
				type: "noteArchived",
				data
			} as SocketEvent)
		})

		this.socket.on("noteDeleted", (data: SocketNoteDeleted) => {
			this.emit("socketEvent", {
				type: "noteDeleted",
				data
			} as SocketEvent)
		})

		this.socket.on("noteTitleEdited", (data: SocketNoteTitleEdited) => {
			this.emit("socketEvent", {
				type: "noteTitleEdited",
				data
			} as SocketEvent)
		})

		this.socket.on("noteParticipantPermissions", (data: SocketNoteParticipantPermissions) => {
			this.emit("socketEvent", {
				type: "noteParticipantPermissions",
				data
			} as SocketEvent)
		})

		this.socket.on("noteRestored", (data: SocketNoteRestored) => {
			this.emit("socketEvent", {
				type: "noteRestored",
				data
			} as SocketEvent)
		})

		this.socket.on("noteParticipantRemoved", (data: SocketNoteParticipantRemoved) => {
			this.emit("socketEvent", {
				type: "noteParticipantRemoved",
				data
			} as SocketEvent)
		})

		this.socket.on("noteParticipantNew", (data: SocketNoteParticipantNew) => {
			this.emit("socketEvent", {
				type: "noteParticipantNew",
				data
			} as SocketEvent)
		})

		this.socket.on("noteNew", (data: SocketNoteNew) => {
			this.emit("socketEvent", {
				type: "noteNew",
				data
			} as SocketEvent)
		})

		this.socket.on("chatMessageEdited", (data: SocketChatMessageEdited) => {
			this.emit("socketEvent", {
				type: "chatMessageEdited",
				data
			} as SocketEvent)
		})

		this.socket.on("chatConversationNameEdited", (data: SocketChatConversationNameEdited) => {
			this.emit("socketEvent", {
				type: "chatConversationNameEdited",
				data
			} as SocketEvent)
		})

		this.socket.on("chatConversationDeleted", (data: SocketChatConversationDeleted) => {
			this.emit("socketEvent", {
				type: "chatConversationDeleted",
				data
			} as SocketEvent)
		})

		this.socket.on("chatConversationParticipantLeft", (data: SocketChatConversationParticipantLeft) => {
			this.emit("socketEvent", {
				type: "chatConversationParticipantLeft",
				data
			} as SocketEvent)
		})

		this.socket.on("chatConversationsNew", (data: SocketChatConversationsNew) => {
			this.emit("socketEvent", {
				type: "chatConversationsNew",
				data
			} as SocketEvent)
		})

		this.socket.on("file-restore", (data: SocketFileRestore) => {
			this.emit("socketEvent", {
				type: "fileRestore",
				data
			} as SocketEvent)
		})

		this.socket.on("fileRestore", (data: SocketFileRestore) => {
			this.emit("socketEvent", {
				type: "fileRestore",
				data
			} as SocketEvent)
		})

		this.socket.on("contactRequestReceived", (data: SocketContactRequestReceived) => {
			this.emit("socketEvent", {
				type: "contactRequestReceived",
				data
			} as SocketEvent)
		})

		this.socket.on("item-favorite", (data: SocketItemFavorite) => {
			this.emit("socketEvent", {
				type: "itemFavorite",
				data
			} as SocketEvent)
		})

		this.socket.on("chatConversationParticipantNew", (data: SocketChatConversationParticipantNew) => {
			this.emit("socketEvent", {
				type: "chatConversationParticipantNew",
				data
			} as SocketEvent)
		})

		this.socket.on("file-deleted-permanent", (data: SocketFileDeletedPermanent) => {
			this.emit("socketEvent", {
				type: "fileDeletedPermanent",
				data
			} as SocketEvent)
		})
	}

	/**
	 * Disconnect from the realtime socket gateway.
	 * @date 3/1/2024 - 6:54:17 PM
	 *
	 * @public
	 */
	public disconnect(): void {
		if (!this.socket || !this.isConnected()) {
			return
		}

		clearInterval(this.pingInterval)

		this.emitSocketAuthed = false

		this.socket.disconnect()
	}

	/**
	 * Check connection status.
	 * @date 3/1/2024 - 6:54:29 PM
	 *
	 * @public
	 * @returns {boolean}
	 */
	public isConnected(): boolean {
		if (!this.socket) {
			return false
		}

		return this.connected
	}
}

export default Socket
