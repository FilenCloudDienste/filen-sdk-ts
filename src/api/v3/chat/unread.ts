import type APIClient from "../../client"

export type ChatUnreadResponse = {
	unread: number
}

/**
 * ChatUnread
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatUnread
 * @typedef {ChatConversationsUnread}
 */
export class ChatUnread {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ChatUnread.
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
	 * Fetch overall unread messages count.
	 * @date 2/13/2024 - 5:05:26 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<ChatUnreadResponse>}
	 */
	public async fetch(): Promise<ChatUnreadResponse> {
		const response = await this.apiClient.request<ChatUnreadResponse>({
			method: "GET",
			endpoint: "/v3/chat/unread"
		})

		return response
	}
}

export default ChatUnread
