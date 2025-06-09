import { EventEmitter } from "events"
import { type DirColors } from "../api/v3/dir/color"
import { type ChatMessage } from "../api/v3/chat/messages"
import { type NoteParticipant, type NoteType } from "../api/v3/notes"
import { type ChatTypingType } from "../api/v3/chat/typing"

export const SOCKET_DEFAULTS = {
	url: "https://socket.filen.io",
	reconnectDelay: 1000,
	maxReconnectDelay: 30000,
	reconnectDelayMultiplier: 1.5,
	defaultPingInterval: 15000
}

// Socket.io protocol constants
const PACKET_TYPE = {
	CONNECT: "0",
	DISCONNECT: "1",
	PING: "2",
	PONG: "3",
	MESSAGE: "4",
	UPGRADE: "5",
	NOOP: "6"
}

const MESSAGE_TYPE = {
	CONNECT: "0",
	DISCONNECT: "1",
	EVENT: "2",
	ACK: "3",
	ERROR: "4",
	BINARY_EVENT: "5",
	BINARY_ACK: "6"
}

// Event type definitions remain the same...
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
	private socket: WebSocket | null = null
	private pingInterval: ReturnType<typeof setInterval> | null = null
	private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
	private apiKey = ""
	private connected = false
	private authenticated = false
	private reconnectDelay = SOCKET_DEFAULTS.reconnectDelay
	private shouldReconnect = true
	private isConnecting = false
	private currentPingInterval = SOCKET_DEFAULTS.defaultPingInterval

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
		// Validate inputs and prevent duplicate connections
		if (this.isConnecting || this.isConnected() || apiKey.length < 32 || apiKey === "anonymous") {
			return
		}

		this.apiKey = apiKey
		this.shouldReconnect = true
		this.isConnecting = true

		this._connect()
	}

	/**
	 * Internal connect method that handles the actual WebSocket connection
	 */
	private _connect(): void {
		try {
			// Clean up any existing connection
			this._cleanup()

			// Build socket.io compatible URL
			const url = new URL(SOCKET_DEFAULTS.url)
			const isSecure = url.protocol === "https:" || url.protocol === "wss:"
			const wsProtocol = isSecure ? "wss:" : "ws:"
			const params = new URLSearchParams({
				EIO: "3",
				transport: "websocket",
				t: Date.now().toString()
			})
			const socketPath = "/socket.io"
			const wsUrl = `${wsProtocol}//${url.host}${socketPath}/?${params.toString()}`

			// Create new WebSocket connection
			this.socket = new WebSocket(wsUrl)

			// Set up event handlers
			this.socket.onopen = this._handleOpen.bind(this)
			this.socket.onmessage = this._handleMessage.bind(this)
			this.socket.onerror = this._handleError.bind(this)
			this.socket.onclose = this._handleClose.bind(this)
		} catch (error) {
			this.isConnecting = false
			this._handleError(error as Event)
		}
	}

	/**
	 * Handle WebSocket open event
	 */
	private _handleOpen(): void {
		this.isConnecting = false
		this.connected = true
		this.reconnectDelay = SOCKET_DEFAULTS.reconnectDelay

		this.emit("connected")
	}

	/**
	 * Handle incoming WebSocket messages
	 */
	private _handleMessage(event: MessageEvent): void {
		try {
			const data = event.data as string
			const packetType = data.charAt(0)
			const payload = data.substring(1)

			switch (packetType) {
				case PACKET_TYPE.CONNECT: {
					// Handle connection handshake
					this._handleHandshake(payload)

					break
				}

				case PACKET_TYPE.PONG: {
					// Server acknowledged our ping
					break
				}

				case PACKET_TYPE.MESSAGE: {
					// Handle socket.io messages
					this._handleSocketIOMessage(payload)

					break
				}
			}
		} catch (error) {
			console.error("Error handling socket message:", error)
		}
	}

	/**
	 * Handle socket.io handshake
	 */
	private _handleHandshake(payload: string): void {
		try {
			const config = JSON.parse(payload)
			const pingInterval = parseInt(config?.pingInterval ?? "15000") || SOCKET_DEFAULTS.defaultPingInterval

			this.currentPingInterval = pingInterval

			// Send namespace connect
			this._sendRaw(PACKET_TYPE.MESSAGE + MESSAGE_TYPE.CONNECT)

			// Start authentication
			this._sendEvent("authed", Date.now())

			// Start ping interval
			this._startPingInterval()
		} catch (error) {
			console.error("Error handling socket handshake:", error)
		}
	}

	/**
	 * Handle socket.io protocol messages
	 */
	private _handleSocketIOMessage(payload: string): void {
		const messageType = payload.charAt(0)
		const messageData = payload.substring(1)

		if (messageType !== MESSAGE_TYPE.EVENT) {
			return
		}

		try {
			const parsed = JSON.parse(messageData)

			if (!Array.isArray(parsed) || parsed.length === 0) {
				return
			}

			const [eventName, ...args] = parsed
			const eventData = args[0]

			switch (eventName) {
				case "authFailed": {
					this.authenticated = false
					this.emit("authFailed")
					this.disconnect()

					break
				}

				case "authed": {
					if (eventData === false) {
						// Need to authenticate
						this.authenticated = false
						this._sendEvent("auth", { apiKey: this.apiKey })
					}

					break
				}

				default: {
					// Handle all other events
					this._handleSocketEvent(eventName, eventData)
				}
			}
		} catch (error) {
			console.error("Error parsing socket.io message:", error)
		}
	}

	/**
	 * Handle socket events and emit them with proper typing
	 */
	private _handleSocketEvent(event: string, data: unknown): void {
		// Map event names to their types
		const eventMappings: Record<string, string> = {
			"new-event": "newEvent",
			newEvent: "newEvent",
			"file-rename": "fileRename",
			fileRename: "fileRename",
			"file-archive-restored": "fileArchiveRestored",
			fileArchiveRestored: "fileArchiveRestored",
			"file-new": "fileNew",
			fileNew: "fileNew",
			"file-move": "fileMove",
			fileMove: "fileMove",
			"file-trash": "fileTrash",
			fileTrash: "fileTrash",
			"file-archived": "fileArchived",
			fileArchived: "fileArchived",
			"folder-rename": "folderRename",
			folderRename: "folderRename",
			"folder-trash": "folderTrash",
			folderTrash: "folderTrash",
			"folder-move": "folderMove",
			folderMove: "folderMove",
			"folder-sub-created": "folderSubCreated",
			folderSubCreated: "folderSubCreated",
			"folder-restore": "folderRestore",
			folderRestore: "folderRestore",
			"folder-color-changed": "folderColorChanged",
			folderColorChanged: "folderColorChanged",
			"trash-empty": "trashEmpty",
			trashEmpty: "trashEmpty",
			passwordChanged: "passwordChanged",
			chatMessageNew: "chatMessageNew",
			chatTyping: "chatTyping",
			chatMessageDelete: "chatMessageDelete",
			chatMessageEmbedDisabled: "chatMessageEmbedDisabled",
			noteContentEdited: "noteContentEdited",
			noteArchived: "noteArchived",
			noteDeleted: "noteDeleted",
			noteTitleEdited: "noteTitleEdited",
			noteParticipantPermissions: "noteParticipantPermissions",
			noteRestored: "noteRestored",
			noteParticipantRemoved: "noteParticipantRemoved",
			noteParticipantNew: "noteParticipantNew",
			noteNew: "noteNew",
			chatMessageEdited: "chatMessageEdited",
			chatConversationNameEdited: "chatConversationNameEdited",
			chatConversationDeleted: "chatConversationDeleted",
			chatConversationParticipantLeft: "chatConversationParticipantLeft",
			chatConversationsNew: "chatConversationsNew",
			"file-restore": "fileRestore",
			fileRestore: "fileRestore",
			contactRequestReceived: "contactRequestReceived",
			"item-favorite": "itemFavorite",
			chatConversationParticipantNew: "chatConversationParticipantNew",
			"file-deleted-permanent": "fileDeletedPermanent"
		}

		const eventType = eventMappings[event]

		if (eventType) {
			const socketEvent =
				eventType === "trashEmpty" || eventType === "passwordChanged"
					? {
							type: eventType
					  }
					: {
							type: eventType,
							data
					  }

			this.emit("socketEvent", socketEvent)
		}
	}

	/**
	 * Handle WebSocket errors
	 */
	private _handleError(error: Event): void {
		this.emit("error", error)

		this.isConnecting = false
	}

	/**
	 * Handle WebSocket close event
	 */
	private _handleClose(): void {
		const wasConnected = this.connected

		this._cleanup()

		if (wasConnected) {
			this.emit("disconnected")
		}

		// Attempt to reconnect if enabled
		if (this.shouldReconnect && this.apiKey) {
			this._scheduleReconnect()
		}
	}

	/**
	 * Schedule a reconnection attempt
	 */
	private _scheduleReconnect(): void {
		if (this.reconnectTimeout) {
			return
		}

		this.reconnectTimeout = setTimeout(() => {
			this.reconnectTimeout = null
			if (this.shouldReconnect && !this.isConnected()) {
				this.isConnecting = true
				this._connect()
			}
		}, this.reconnectDelay)

		// Increase delay for next attempt (exponential backoff)
		this.reconnectDelay = Math.min(this.reconnectDelay * SOCKET_DEFAULTS.reconnectDelayMultiplier, SOCKET_DEFAULTS.maxReconnectDelay)
	}

	/**
	 * Start ping interval
	 */
	private _startPingInterval(): void {
		this._stopPingInterval()

		this.pingInterval = setInterval(() => {
			if (this.isConnected()) {
				// Send socket.io ping
				this._sendRaw(PACKET_TYPE.PING)

				// Send authed event
				this._sendEvent("authed", Date.now())
			}
		}, this.currentPingInterval)
	}

	/**
	 * Stop ping interval
	 */
	private _stopPingInterval(): void {
		if (this.pingInterval) {
			clearInterval(this.pingInterval)

			this.pingInterval = null
		}
	}

	/**
	 * Send raw socket.io packet
	 */
	private _sendRaw(packet: string): void {
		if (!this.isConnected() || this.socket?.readyState !== WebSocket.OPEN) {
			return
		}

		try {
			this.socket.send(packet)
		} catch (error) {
			console.error("Error sending socket packet:", error)
		}
	}

	/**
	 * Send a socket.io event
	 */
	private _sendEvent(event: string, data?: unknown): void {
		if (!this.isConnected() || this.socket?.readyState !== WebSocket.OPEN) {
			return
		}

		try {
			const payload = data !== undefined ? [event, data] : [event]
			const packet = PACKET_TYPE.MESSAGE + MESSAGE_TYPE.EVENT + JSON.stringify(payload)

			this.socket.send(packet)
		} catch (error) {
			console.error("Error sending socket event:", error)
		}
	}

	/**
	 * Public method to emit events (for compatibility with socket.io API)
	 */
	public emit(event: string, ...args: unknown[]): boolean {
		// Check if it's an internal event or socket.io event
		const internalEvents = ["connected", "disconnected", "socketAuthed", "authFailed", "error", "socketEvent"]

		if (internalEvents.includes(event)) {
			// Emit as EventEmitter event
			return super.emit(event, ...args)
		} else {
			// Send as socket.io event
			this._sendEvent(event, args[0])

			return true
		}
	}

	/**
	 * Clean up resources
	 */
	private _cleanup(): void {
		this.connected = false
		this.authenticated = false
		this.isConnecting = false

		this._stopPingInterval()

		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout)
			this.reconnectTimeout = null
		}

		if (this.socket) {
			this.socket.onopen = null
			this.socket.onmessage = null
			this.socket.onerror = null
			this.socket.onclose = null

			if (this.socket.readyState === WebSocket.OPEN) {
				this.socket.close()
			}

			this.socket = null
		}
	}

	/**
	 * Disconnect from the realtime socket gateway.
	 * @date 3/1/2024 - 6:54:17 PM
	 *
	 * @public
	 */
	public disconnect(): void {
		this.shouldReconnect = false

		this._cleanup()
	}

	/**
	 * Check connection status.
	 * @date 3/1/2024 - 6:54:29 PM
	 *
	 * @public
	 * @returns {boolean}
	 */
	public isConnected(): boolean {
		return this.connected && this.socket !== null && this.socket.readyState === WebSocket.OPEN
	}

	/**
	 * Check authentication status.
	 * @public
	 * @returns {boolean}
	 */
	public isAuthenticated(): boolean {
		return this.authenticated
	}
}

export default Socket
