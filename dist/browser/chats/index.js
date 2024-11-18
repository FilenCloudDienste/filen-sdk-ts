import { MAX_CHAT_SIZE } from "..";
import { promiseAllChunked, uuidv4 } from "../utils";
/**
 * Chats
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class Chats
 * @typedef {Chats}
 */
export class Chats {
    api;
    sdkConfig;
    _chatKeyCache = new Map();
    sdk;
    /**
     * Creates an instance of Chats.
     * @date 2/9/2024 - 5:54:11 AM
     *
     * @constructor
     * @public
     * @param {ChatsConfig} params
     */
    constructor(params) {
        this.api = params.api;
        this.sdkConfig = params.sdkConfig;
        this.sdk = params.sdk;
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
    async chatKey({ conversation }) {
        if (this._chatKeyCache.has(conversation)) {
            return this._chatKeyCache.get(conversation);
        }
        const all = await this.api.v3().chat().conversations();
        const chat = all.filter(chat => chat.uuid === conversation);
        if (chat.length === 0 || !chat[0]) {
            throw new Error(`Could not find chat ${conversation}.`);
        }
        if (chat[0].ownerId === this.sdkConfig.userId && chat[0].ownerMetadata) {
            const decryptedChatKey = await this.sdk.getWorker().crypto.decrypt.chatKeyOwner({ metadata: chat[0].ownerMetadata });
            this._chatKeyCache.set(conversation, decryptedChatKey);
            return decryptedChatKey;
        }
        const participant = chat[0].participants.filter(participant => participant.userId === this.sdkConfig.userId);
        if (participant.length === 0 || !participant[0]) {
            throw new Error(`Could not find participant metadata for chat ${conversation}.`);
        }
        const decryptedChatKey = await this.sdk
            .getWorker()
            .crypto.decrypt.chatKeyParticipant({ metadata: participant[0].metadata, privateKey: this.sdkConfig.privateKey });
        this._chatKeyCache.set(conversation, decryptedChatKey);
        return decryptedChatKey;
    }
    /**
     * Fetch all chat conversations.
     * @date 2/20/2024 - 5:35:54 AM
     *
     * @public
     * @async
     * @returns {Promise<ChatConversation[]>}
     */
    async conversations() {
        const convos = await this.api.v3().chat().conversations();
        const chatConversations = [];
        const promises = [];
        for (const convo of convos) {
            promises.push(new Promise((resolve, reject) => {
                const metadata = convo.participants.filter(p => p.userId === this.sdkConfig.userId);
                if (metadata.length === 0 || !metadata[0]) {
                    reject(new Error("Conversation metadata not found."));
                    return;
                }
                const keyPromise = this._chatKeyCache.has(convo.uuid)
                    ? Promise.resolve(this._chatKeyCache.get(convo.uuid))
                    : this.chatKey({ conversation: convo.uuid });
                keyPromise
                    .then(decryptedChatKey => {
                    this._chatKeyCache.set(convo.uuid, decryptedChatKey);
                    const namePromise = typeof convo.name === "string" && convo.name.length > 0
                        ? this.sdk.getWorker().crypto.decrypt.chatConversationName({
                            name: convo.name,
                            key: decryptedChatKey
                        })
                        : Promise.resolve("");
                    const messagePromise = typeof convo.lastMessage === "string" && convo.lastMessage.length > 0
                        ? this.sdk.getWorker().crypto.decrypt.chatMessage({
                            message: convo.lastMessage,
                            key: decryptedChatKey
                        })
                        : Promise.resolve("");
                    Promise.all([namePromise, messagePromise])
                        .then(([nameDecrypted, lastMessageDecrypted]) => {
                        chatConversations.push({
                            ...convo,
                            lastMessage: lastMessageDecrypted,
                            name: nameDecrypted
                        });
                        resolve();
                    })
                        .catch(reject);
                })
                    .catch(reject);
            }));
        }
        await promiseAllChunked(promises);
        return chatConversations;
    }
    /**
     * Fetch all recent chat conversations.
     * @date 2/20/2024 - 5:37:59 AM
     *
     * @public
     * @async
     * @returns {Promise<ChatConversation[]>}
     */
    async conversationsRecents() {
        const convos = await this.conversations();
        return convos.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
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
    async get({ conversation }) {
        const convos = await this.conversations();
        const chat = convos.filter(convo => convo.uuid === conversation);
        if (chat.length === 0) {
            throw new Error(`Chat conversation ${conversation} not found.`);
        }
        if (!chat[0]) {
            throw new Error("Chat not found");
        }
        return chat[0];
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
    async create({ uuid, contacts }) {
        const [uuidToUse, key] = await Promise.all([
            uuid ? Promise.resolve(uuid) : await uuidv4(),
            this.sdk.getWorker().crypto.utils.generateRandomString({ length: 32 })
        ]);
        const [metadata, ownerMetadata] = await Promise.all([
            this.sdk.getWorker().crypto.encrypt.metadataPublic({
                metadata: JSON.stringify({ key }),
                publicKey: this.sdkConfig.publicKey
            }),
            this.sdk.getWorker().crypto.encrypt.metadata({ metadata: JSON.stringify({ key }) })
        ]);
        await this.api.v3().chat().conversationsCreate({
            uuid: uuidToUse,
            metadata,
            ownerMetadata
        });
        this._chatKeyCache.set(uuidToUse, key);
        if (contacts) {
            await promiseAllChunked(contacts.map(contact => this.addParticipant({
                conversation: uuidToUse,
                contact
            })));
        }
        return uuidToUse;
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
    async deleteMessage({ uuid }) {
        await this.api.v3().chat().delete({ uuid });
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
    async delete({ conversation }) {
        await this.api.v3().chat().conversationsDelete({ uuid: conversation });
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
    async editConversationName({ conversation, name }) {
        const key = await this.chatKey({ conversation });
        const nameEncrypted = await this.sdk.getWorker().crypto.encrypt.chatConversationName({
            name,
            key
        });
        await this.api.v3().chat().conversationsName().edit({
            uuid: conversation,
            name: nameEncrypted
        });
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
    async editMessage({ uuid, conversation, message }) {
        const key = await this.chatKey({ conversation });
        const messageEncrypted = await this.sdk.getWorker().crypto.encrypt.chatMessage({
            message,
            key
        });
        if (messageEncrypted.length >= MAX_CHAT_SIZE) {
            throw new Error(`Maximum encrypted message size is ${MAX_CHAT_SIZE} characters.`);
        }
        await this.api.v3().chat().edit({
            uuid,
            conversation,
            message: messageEncrypted
        });
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
    async sendMessage({ uuid, conversation, message, replyTo }) {
        const [key, uuidToUse] = await Promise.all([this.chatKey({ conversation }), uuid ? Promise.resolve(uuid) : uuidv4()]);
        const messageEncrypted = await this.sdk.getWorker().crypto.encrypt.chatMessage({
            message,
            key
        });
        if (messageEncrypted.length >= MAX_CHAT_SIZE) {
            throw new Error(`Maximum encrypted message size is ${MAX_CHAT_SIZE} characters.`);
        }
        await this.api.v3().chat().send({
            uuid: uuidToUse,
            conversation,
            message: messageEncrypted,
            replyTo
        });
        return uuidToUse;
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
    async sendTyping({ conversation, type }) {
        await this.api.v3().chat().typing({
            conversation,
            type
        });
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
    async messages({ conversation, timestamp }) {
        const [key, _messages] = await Promise.all([
            this.chatKey({ conversation }),
            this.api
                .v3()
                .chat()
                .messages({
                conversation,
                timestamp: timestamp ? timestamp : Date.now() + 3600000
            })
        ]);
        const chatMessages = [];
        const promises = [];
        for (const message of _messages) {
            promises.push(new Promise((resolve, reject) => {
                const replyToPromise = message.replyTo.uuid.length > 0 && message.replyTo.message.length > 0
                    ? this.sdk.getWorker().crypto.decrypt.chatMessage({
                        message: message.replyTo.message,
                        key
                    })
                    : Promise.resolve("");
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
                            message: replyToDecrypted.length > 0
                                ? replyToDecrypted
                                : `CANNOT_DECRYPT_REPLY_MESSAGE_${message.replyTo.uuid}`
                        }
                    });
                    resolve();
                })
                    .catch(reject);
            }));
        }
        await promiseAllChunked(promises);
        return chatMessages;
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
    async addParticipant({ conversation, contact }) {
        const key = await this.chatKey({ conversation });
        const publicKey = (await this.api.v3().user().publicKey({ email: contact.email })).publicKey;
        const metadata = await this.sdk.getWorker().crypto.encrypt.metadataPublic({
            metadata: JSON.stringify({ key }),
            publicKey
        });
        await this.api.v3().chat().conversationsParticipants().add({
            uuid: conversation,
            contactUUID: contact.uuid,
            metadata
        });
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
    async removeParticipant({ conversation, userId }) {
        await this.api.v3().chat().conversationsParticipants().remove({
            uuid: conversation,
            userId
        });
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
    async markConversationAsRead({ conversation }) {
        await this.api.v3().chat().conversationsRead({ uuid: conversation });
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
    async conversationUnreadCount({ conversation }) {
        return (await this.api.v3().chat().conversationsUnread({ uuid: conversation })).unread;
    }
    /**
     * Get the unread notification count (includes all conversations).
     * @date 2/20/2024 - 6:08:07 AM
     *
     * @public
     * @async
     * @returns {Promise<number>}
     */
    async unread() {
        return (await this.api.v3().chat().unread()).unread;
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
    async conversationOnline({ conversation }) {
        return await this.api.v3().chat().conversationsOnline({ conversation });
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
    async disableMessageEmbed({ uuid }) {
        await this.api.v3().chat().message().embed().disable({ uuid });
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
    async leave({ conversation }) {
        await this.api.v3().chat().conversationsLeave({ uuid: conversation });
    }
    /**
     * Fetch last focus.
     * @date 2/20/2024 - 6:22:46 AM
     *
     * @public
     * @async
     * @returns {Promise<ChatLastFocusValues[]>}
     */
    async lastFocus() {
        return await this.api.v3().chat().lastFocus();
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
    async updateLastFocus({ values }) {
        await this.api.v3().chat().lastFocusUpdate({ conversations: values });
    }
}
export default Chats;
//# sourceMappingURL=index.js.map