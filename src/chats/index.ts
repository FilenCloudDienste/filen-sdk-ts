import { MAX_CHAT_SIZE, type FilenSDK } from ".."
import { type ChatConversation } from "../api/v3/chat/conversations"
import { promiseAllChunked, uuidv4, promiseAllSettledChunked } from "../utils"
import { type Contact } from "../api/v3/contacts"
import { ChatTypingType } from "../api/v3/chat/typing"
import { type ChatMessage } from "../api/v3/chat/messages"
import { type ChatConversationsOnlineUser } from "../api/v3/chat/conversations/online"
import { type ChatLastFocusValues } from "../api/v3/chat/lastFocusUpdate"

/**
 * Chats
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class Chats
 * @typedef {Chats}
 */
export class Chats {
	private readonly _chatKeyCache = new Map<string, string>()
	private readonly sdk: FilenSDK

	public constructor(sdk: FilenSDK) {
		this.sdk = sdk
	}

	/**
	 * Get the encryption key of a chat.
	 * @date 2/20/2024 - 6:05:30 AM
	 *
	 * @public
	 * @async
	 * @param {{ conversation: string }} param0
	 * @param {string} param0.conversation
	 * @returns {Promise<string>}
	 */
	public async chatKey({ conversation }: { conversation: string }): Promise<string> {
		if (this._chatKeyCache.has(conversation)) {
			return this._chatKeyCache.get(conversation)!
		}

		const all = await this.sdk.api(3).chat().conversations()
		const chat = all.filter(chat => chat.uuid === conversation)

		if (chat.length === 0 || !chat[0]) {
			throw new Error(`Could not find chat ${conversation}.`)
		}

		if (chat[0].ownerId === this.sdk.config.userId && chat[0].ownerMetadata) {
			const decryptedChatKey = await this.sdk.getWorker().crypto.decrypt.chatKeyOwner({
				metadata: chat[0].ownerMetadata
			})

			this._chatKeyCache.set(conversation, decryptedChatKey)

			return decryptedChatKey
		}

		const participant = chat[0].participants.filter(participant => participant.userId === this.sdk.config.userId!)

		if (participant.length === 0 || !participant[0]) {
			throw new Error(`Could not find participant metadata for chat ${conversation}.`)
		}

		const decryptedChatKey = await this.sdk.getWorker().crypto.decrypt.chatKeyParticipant({
			metadata: participant[0].metadata,
			privateKey: this.sdk.config.privateKey!
		})

		this._chatKeyCache.set(conversation, decryptedChatKey)

		return decryptedChatKey
	}

	/**
	 * Fetch all chat conversations.
	 * @date 2/20/2024 - 5:35:54 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<ChatConversation[]>}
	 */
	public async conversations(): Promise<ChatConversation[]> {
		const convos = await this.sdk.api(3).chat().conversations()
		const chatConversations: ChatConversation[] = []
		const promises: Promise<void>[] = []

		for (const convo of convos) {
			promises.push(
				new Promise<void>((resolve, reject) => {
					const metadata = convo.participants.filter(p => p.userId === this.sdk.config.userId!)

					if (metadata.length === 0 || !metadata[0]) {
						reject(new Error("Conversation metadata not found."))

						return
					}

					const keyPromise = this._chatKeyCache.has(convo.uuid)
						? Promise.resolve(this._chatKeyCache.get(convo.uuid)!)
						: this.chatKey({
								conversation: convo.uuid
						  })

					keyPromise
						.then(decryptedChatKey => {
							this._chatKeyCache.set(convo.uuid, decryptedChatKey)

							const namePromise =
								typeof convo.name === "string" && convo.name.length > 0
									? this.sdk.getWorker().crypto.decrypt.chatConversationName({
											name: convo.name,
											key: decryptedChatKey
									  })
									: Promise.resolve("")
							const messagePromise =
								typeof convo.lastMessage === "string" && convo.lastMessage.length > 0
									? this.sdk.getWorker().crypto.decrypt.chatMessage({
											message: convo.lastMessage,
											key: decryptedChatKey
									  })
									: Promise.resolve("")

							Promise.all([namePromise, messagePromise])
								.then(([nameDecrypted, lastMessageDecrypted]) => {
									chatConversations.push({
										...convo,
										lastMessage: lastMessageDecrypted,
										name: nameDecrypted
									})

									resolve()
								})
								.catch(reject)
						})
						.catch(reject)
				})
			)
		}

		await promiseAllSettledChunked(promises)

		return chatConversations
	}

	/**
	 * Fetch all recent chat conversations.
	 * @date 2/20/2024 - 5:37:59 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<ChatConversation[]>}
	 */
	public async conversationsRecents(): Promise<ChatConversation[]> {
		const convos = await this.conversations()

		return convos.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)
	}

	/**
	 * Fetch a chat conversation.
	 * @date 2/20/2024 - 5:39:11 AM
	 *
	 * @public
	 * @async
	 * @param {{conversation: string}} param0
	 * @param {string} param0.conversation
	 * @returns {Promise<ChatConversation>}
	 */
	public async get({ conversation }: { conversation: string }): Promise<ChatConversation> {
		const convos = await this.conversations()
		const chat = convos.filter(convo => convo.uuid === conversation)

		if (chat.length === 0) {
			throw new Error(`Chat conversation ${conversation} not found.`)
		}

		if (!chat[0]) {
			throw new Error("Chat not found")
		}

		return chat[0]
	}

	/**
	 * Create a chat conversation. Optionally add participants to it.
	 * @date 2/20/2024 - 5:48:07 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid?: string; contacts?: Contact[] }} param0
	 * @param {string} param0.uuid
	 * @param {{}} param0.contacts
	 * @returns {Promise<string>}
	 */
	public async create({ uuid, contacts }: { uuid?: string; contacts?: Contact[] }): Promise<string> {
		const [uuidToUse, key] = await Promise.all([
			uuid ? Promise.resolve(uuid) : uuidv4(),
			this.sdk.getWorker().crypto.utils.generateEncryptionKey("metadata")
		])

		const [metadata, ownerMetadata] = await Promise.all([
			this.sdk.getWorker().crypto.encrypt.metadataPublic({
				metadata: JSON.stringify({
					key
				}),
				publicKey: this.sdk.config.publicKey!
			}),
			this.sdk.getWorker().crypto.encrypt.metadata({
				metadata: JSON.stringify({
					key
				})
			})
		])

		await this.sdk._locks.chatsWrite.acquire()

		try {
			await this.sdk.api(3).chat().conversationsCreate({
				uuid: uuidToUse,
				metadata,
				ownerMetadata
			})

			this._chatKeyCache.set(uuidToUse, key)

			if (contacts) {
				await promiseAllChunked(
					contacts.map(contact =>
						this.addParticipant({
							conversation: uuidToUse,
							contact
						})
					)
				)
			}

			return uuidToUse
		} finally {
			await this.sdk._locks.chatsWrite.release().catch(() => {})
		}
	}

	/**
	 * Delete a chat message.
	 * @date 2/20/2024 - 5:52:09 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async deleteMessage({ uuid }: { uuid: string }): Promise<void> {
		await this.sdk.api(3).chat().delete({
			uuid
		})
	}

	/**
	 * Delete a chat conversation.
	 * @date 2/20/2024 - 6:15:57 AM
	 *
	 * @public
	 * @async
	 * @param {{conversation: string}} param0
	 * @param {string} param0.conversation
	 * @returns {Promise<void>}
	 */
	public async delete({ conversation }: { conversation: string }): Promise<void> {
		await this.sdk._locks.chatsWrite.acquire()

		try {
			await this.sdk.api(3).chat().conversationsDelete({
				uuid: conversation
			})
		} finally {
			await this.sdk._locks.chatsWrite.release().catch(() => {})
		}
	}

	/**
	 * Edit a conversation name.
	 * @date 2/20/2024 - 6:03:14 AM
	 *
	 * @public
	 * @async
	 * @param {{conversation: string, name: string}} param0
	 * @param {string} param0.conversation
	 * @param {string} param0.name
	 * @returns {Promise<void>}
	 */
	public async editConversationName({ conversation, name }: { conversation: string; name: string }): Promise<void> {
		const key = await this.chatKey({
			conversation
		})

		const nameEncrypted = await this.sdk.getWorker().crypto.encrypt.chatConversationName({
			name,
			key
		})

		await this.sdk._locks.chatsWrite.acquire()

		try {
			await this.sdk.api(3).chat().conversationsName().edit({
				uuid: conversation,
				name: nameEncrypted
			})
		} finally {
			await this.sdk._locks.chatsWrite.release().catch(() => {})
		}
	}

	/**
	 * Edit a chat message.
	 * @date 2/20/2024 - 5:52:16 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; conversation: string; message: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.conversation
	 * @param {string} param0.message
	 * @returns {Promise<void>}
	 */
	public async editMessage({ uuid, conversation, message }: { uuid: string; conversation: string; message: string }): Promise<void> {
		const key = await this.chatKey({
			conversation
		})

		const messageEncrypted = await this.sdk.getWorker().crypto.encrypt.chatMessage({
			message,
			key
		})

		if (messageEncrypted.length >= MAX_CHAT_SIZE) {
			throw new Error(`Maximum encrypted message size is ${MAX_CHAT_SIZE} characters.`)
		}

		await this.sdk.api(3).chat().edit({
			uuid,
			conversation,
			message: messageEncrypted
		})
	}

	/**
	 * Send a message.
	 * @date 2/20/2024 - 5:54:24 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid?: string; conversation: string; message: string, replyTo: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.conversation
	 * @param {string} param0.message
	 * @param {string} param0.replyTo
	 * @returns {Promise<string>}
	 */
	public async sendMessage({
		uuid,
		conversation,
		message,
		replyTo
	}: {
		uuid?: string
		conversation: string
		message: string
		replyTo: string
	}): Promise<string> {
		const [key, uuidToUse] = await Promise.all([
			this.chatKey({
				conversation
			}),
			uuid ? Promise.resolve(uuid) : uuidv4()
		])

		const messageEncrypted = await this.sdk.getWorker().crypto.encrypt.chatMessage({
			message,
			key
		})

		if (messageEncrypted.length >= MAX_CHAT_SIZE) {
			throw new Error(`Maximum encrypted message size is ${MAX_CHAT_SIZE} characters.`)
		}

		await this.sdk.api(3).chat().send({
			uuid: uuidToUse,
			conversation,
			message: messageEncrypted,
			replyTo
		})

		return uuidToUse
	}

	/**
	 * Send a typing event.
	 * @date 2/20/2024 - 5:55:20 AM
	 *
	 * @public
	 * @async
	 * @param {{conversation: string, type: ChatTypingType}} param0
	 * @param {string} param0.conversation
	 * @param {ChatTypingType} param0.type
	 * @returns {Promise<void>}
	 */
	public async sendTyping({ conversation, type }: { conversation: string; type: ChatTypingType }): Promise<void> {
		await this.sdk.api(3).chat().typing({
			conversation,
			type
		})
	}

	/**
	 * Fetch chat messages from the given timestamp ordered DESC. Can be used for pagination.
	 * @date 2/20/2024 - 6:00:37 AM
	 *
	 * @public
	 * @async
	 * @param {{ conversation: string; timestamp?: number }} param0
	 * @param {string} param0.conversation
	 * @param {number} param0.timestamp
	 * @returns {Promise<ChatMessage[]>}
	 */
	public async messages({ conversation, timestamp }: { conversation: string; timestamp?: number }): Promise<ChatMessage[]> {
		const [key, _messages] = await Promise.all([
			this.chatKey({
				conversation
			}),
			this.sdk
				.api(3)
				.chat()
				.messages({
					conversation,
					timestamp: timestamp ? timestamp : Date.now() + 3600000
				})
		])

		const chatMessages: ChatMessage[] = []
		const promises: Promise<void>[] = []

		for (const message of _messages) {
			promises.push(
				new Promise<void>((resolve, reject) => {
					const replyToPromise =
						message.replyTo.uuid.length > 0 && message.replyTo.message.length > 0
							? this.sdk.getWorker().crypto.decrypt.chatMessage({
									message: message.replyTo.message,
									key
							  })
							: Promise.resolve("")

					Promise.all([
						this.sdk.getWorker().crypto.decrypt.chatMessage({
							message: message.message,
							key
						}),
						replyToPromise
					])
						.then(([messageDecrypted, replyToDecrypted]) => {
							chatMessages.push({
								...message,
								message: messageDecrypted.length > 0 ? messageDecrypted : `CANNOT_DECRYPT_MESSAGE_${message.uuid}`,
								replyTo: {
									...message.replyTo,
									message:
										replyToDecrypted.length > 0
											? replyToDecrypted
											: `CANNOT_DECRYPT_REPLY_MESSAGE_${message.replyTo.uuid}`
								}
							})

							resolve()
						})
						.catch(reject)
				})
			)
		}

		await promiseAllSettledChunked(promises)

		return chatMessages
	}

	/**
	 * Add a participant to a chat.
	 * @date 2/20/2024 - 5:46:46 AM
	 *
	 * @public
	 * @async
	 * @param {{ conversation: string; contact: Contact }} param0
	 * @param {string} param0.conversation
	 * @param {Contact} param0.contact
	 * @returns {Promise<void>}
	 */
	public async addParticipant({ conversation, contact }: { conversation: string; contact: Contact }): Promise<void> {
		const key = await this.chatKey({
			conversation
		})

		const publicKey = (
			await this.sdk.api(3).user().publicKey({
				email: contact.email
			})
		).publicKey

		const metadata = await this.sdk.getWorker().crypto.encrypt.metadataPublic({
			metadata: JSON.stringify({
				key
			}),
			publicKey
		})

		await this.sdk._locks.chatsWrite.acquire()

		try {
			await this.sdk.api(3).chat().conversationsParticipants().add({
				uuid: conversation,
				contactUUID: contact.uuid,
				metadata
			})
		} finally {
			await this.sdk._locks.chatsWrite.release().catch(() => {})
		}
	}

	/**
	 * Remove a participant from a chat.
	 * @date 2/20/2024 - 5:49:45 AM
	 *
	 * @public
	 * @async
	 * @param {{conversation: string, userId: number}} param0
	 * @param {string} param0.conversation
	 * @param {number} param0.userId
	 * @returns {Promise<void>}
	 */
	public async removeParticipant({ conversation, userId }: { conversation: string; userId: number }): Promise<void> {
		await this.sdk._locks.chatsWrite.acquire()

		try {
			await this.sdk.api(3).chat().conversationsParticipants().remove({
				uuid: conversation,
				userId
			})
		} finally {
			await this.sdk._locks.chatsWrite.release().catch(() => {})
		}
	}

	/**
	 * Mark a conversation as read.
	 * @date 2/20/2024 - 6:06:21 AM
	 *
	 * @public
	 * @async
	 * @param {{conversation: string}} param0
	 * @param {string} param0.conversation
	 * @returns {Promise<void>}
	 */
	public async markConversationAsRead({ conversation }: { conversation: string }): Promise<void> {
		await this.sdk.api(3).chat().conversationsRead({
			uuid: conversation
		})
	}

	/**
	 * Get the notification count for a conversation.
	 * @date 2/20/2024 - 6:07:24 AM
	 *
	 * @public
	 * @async
	 * @param {{conversation: string}} param0
	 * @param {string} param0.conversation
	 * @returns {Promise<number>}
	 */
	public async conversationUnreadCount({ conversation }: { conversation: string }): Promise<number> {
		return (
			await this.sdk.api(3).chat().conversationsUnread({
				uuid: conversation
			})
		).unread
	}

	/**
	 * Get the unread notification count (includes all conversations).
	 * @date 2/20/2024 - 6:08:07 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<number>}
	 */
	public async unread(): Promise<number> {
		return (await this.sdk.api(3).chat().unread()).unread
	}

	/**
	 * Get the online status of each participant in a conversation.
	 * @date 2/20/2024 - 6:09:47 AM
	 *
	 * @public
	 * @async
	 * @param {{ conversation: string }} param0
	 * @param {string} param0.conversation
	 * @returns {Promise<ChatConversationsOnlineUser[]>}
	 */
	public async conversationOnline({ conversation }: { conversation: string }): Promise<ChatConversationsOnlineUser[]> {
		return await this.sdk.api(3).chat().conversationsOnline({
			conversation
		})
	}

	/**
	 * Disable a message embed.
	 * @date 2/20/2024 - 6:10:38 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async disableMessageEmbed({ uuid }: { uuid: string }): Promise<void> {
		await this.sdk.api(3).chat().message().embed().disable({
			uuid
		})
	}

	/**
	 * Leave a conversation. Only works if you are not the owner.
	 * @date 2/20/2024 - 6:14:36 AM
	 *
	 * @public
	 * @async
	 * @param {{conversation: string}} param0
	 * @param {string} param0.conversation
	 * @returns {Promise<void>}
	 */
	public async leave({ conversation }: { conversation: string }): Promise<void> {
		await this.sdk.api(3).chat().conversationsLeave({
			uuid: conversation
		})
	}

	/**
	 * Fetch last focus.
	 * @date 2/20/2024 - 6:22:46 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<ChatLastFocusValues[]>}
	 */
	public async lastFocus(): Promise<ChatLastFocusValues[]> {
		return await this.sdk.api(3).chat().lastFocus()
	}

	/**
	 * Update last focus.
	 * @date 2/20/2024 - 6:22:37 AM
	 *
	 * @public
	 * @async
	 * @param {{values: ChatLastFocusValues[]}} param0
	 * @param {{}} param0.values
	 * @returns {Promise<void>}
	 */
	public async updateLastFocus({ values }: { values: ChatLastFocusValues[] }): Promise<void> {
		await this.sdk.api(3).chat().lastFocusUpdate({
			conversations: values
		})
	}

	public async mute({ uuid, mute }: { uuid: string; mute: boolean }): Promise<void> {
		await this.sdk.api(3).chat().mute({
			uuid,
			mute
		})
	}
}

export default Chats
