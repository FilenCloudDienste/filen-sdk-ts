import type API from "../api";
import { type FilenSDKConfig, FilenSDK } from "..";
import { type ChatConversation } from "../api/v3/chat/conversations";
import { type Contact } from "../api/v3/contacts";
import { ChatTypingType } from "../api/v3/chat/typing";
import { type ChatMessage } from "../api/v3/chat/messages";
import { type ChatConversationsOnlineUser } from "../api/v3/chat/conversations/online";
import { type ChatLastFocusValues } from "../api/v3/chat/lastFocusUpdate";
export type ChatsConfig = {
    sdkConfig: FilenSDKConfig;
    api: API;
    sdk: FilenSDK;
};
/**
 * Chats
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class Chats
 * @typedef {Chats}
 */
export declare class Chats {
    private readonly api;
    private readonly sdkConfig;
    private readonly _chatKeyCache;
    private readonly sdk;
    /**
     * Creates an instance of Chats.
     * @date 2/9/2024 - 5:54:11 AM
     *
     * @constructor
     * @public
     * @param {ChatsConfig} params
     */
    constructor(params: ChatsConfig);
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
    chatKey({ conversation }: {
        conversation: string;
    }): Promise<string>;
    /**
     * Fetch all chat conversations.
     * @date 2/20/2024 - 5:35:54 AM
     *
     * @public
     * @async
     * @returns {Promise<ChatConversation[]>}
     */
    conversations(): Promise<ChatConversation[]>;
    /**
     * Fetch all recent chat conversations.
     * @date 2/20/2024 - 5:37:59 AM
     *
     * @public
     * @async
     * @returns {Promise<ChatConversation[]>}
     */
    conversationsRecents(): Promise<ChatConversation[]>;
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
    get({ conversation }: {
        conversation: string;
    }): Promise<ChatConversation>;
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
    create({ uuid, contacts }: {
        uuid?: string;
        contacts?: Contact[];
    }): Promise<string>;
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
    deleteMessage({ uuid }: {
        uuid: string;
    }): Promise<void>;
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
    delete({ conversation }: {
        conversation: string;
    }): Promise<void>;
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
    editConversationName({ conversation, name }: {
        conversation: string;
        name: string;
    }): Promise<void>;
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
    editMessage({ uuid, conversation, message }: {
        uuid: string;
        conversation: string;
        message: string;
    }): Promise<void>;
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
    sendMessage({ uuid, conversation, message, replyTo }: {
        uuid?: string;
        conversation: string;
        message: string;
        replyTo: string;
    }): Promise<string>;
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
    sendTyping({ conversation, type }: {
        conversation: string;
        type: ChatTypingType;
    }): Promise<void>;
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
    messages({ conversation, timestamp }: {
        conversation: string;
        timestamp?: number;
    }): Promise<ChatMessage[]>;
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
    addParticipant({ conversation, contact }: {
        conversation: string;
        contact: Contact;
    }): Promise<void>;
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
    removeParticipant({ conversation, userId }: {
        conversation: string;
        userId: number;
    }): Promise<void>;
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
    markConversationAsRead({ conversation }: {
        conversation: string;
    }): Promise<void>;
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
    conversationUnreadCount({ conversation }: {
        conversation: string;
    }): Promise<number>;
    /**
     * Get the unread notification count (includes all conversations).
     * @date 2/20/2024 - 6:08:07 AM
     *
     * @public
     * @async
     * @returns {Promise<number>}
     */
    unread(): Promise<number>;
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
    conversationOnline({ conversation }: {
        conversation: string;
    }): Promise<ChatConversationsOnlineUser[]>;
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
    disableMessageEmbed({ uuid }: {
        uuid: string;
    }): Promise<void>;
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
    leave({ conversation }: {
        conversation: string;
    }): Promise<void>;
    /**
     * Fetch last focus.
     * @date 2/20/2024 - 6:22:46 AM
     *
     * @public
     * @async
     * @returns {Promise<ChatLastFocusValues[]>}
     */
    lastFocus(): Promise<ChatLastFocusValues[]>;
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
    updateLastFocus({ values }: {
        values: ChatLastFocusValues[];
    }): Promise<void>;
}
export default Chats;
