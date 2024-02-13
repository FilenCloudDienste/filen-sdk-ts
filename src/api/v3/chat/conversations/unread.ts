import type APIClient from "../../../client"

export type ChatConversationsUnreadResponse = {
	unread: number
}

/**
 * ChatConversationsUnread
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsUnread
 * @typedef {ChatConversationsUnread}
 */
export class ChatConversationsUnread {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ChatConversationsUnread.
	 * @date 2/1/2024 - 8:16:39 PM
	 *
	 * @constructor
	 * @public
	 * @param {{ apiClient: APIClient }} param0
	 * @param {APIClient} param0.apiClient
	 */
	public constructor({ apiClient }: { apiClient: APIClient }) {
		this.apiClient = apiClient
	}

	/**
	 * Fetch unread messages count of a chat conversation.
	 * @date 2/13/2024 - 5:01:39 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<ChatConversationsUnreadResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<ChatConversationsUnreadResponse> {
		const response = await this.apiClient.request<ChatConversationsUnreadResponse>({
			method: "POST",
			endpoint: "/v3/chat/conversations/unread",
			data: {
				uuid
			}
		})

		return response
	}
}

export default ChatConversationsUnread
