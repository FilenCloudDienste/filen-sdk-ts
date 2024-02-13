import type APIClient from "../../../client"

export type ChatConversationsOnlineUser = {
	userId: number
	lastActive: number
	appearOffline: boolean
}

export type ChatConversationsOnlineResponse = ChatConversationsOnlineUser[]

/**
 * ChatConversationsOnline
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsOnline
 * @typedef {ChatConversationsOnline}
 */
export class ChatConversationsOnline {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ChatConversationsOnline.
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
	 * Fetch online status info of all participants in a chat conversation.
	 * @date 2/13/2024 - 5:17:03 AM
	 *
	 * @public
	 * @async
	 * @param {{ conversation: string }} param0
	 * @param {string} param0.conversation
	 * @returns {Promise<ChatConversationsOnlineResponse>}
	 */
	public async fetch({ conversation }: { conversation: string }): Promise<ChatConversationsOnlineResponse> {
		const response = await this.apiClient.request<ChatConversationsOnlineResponse>({
			method: "POST",
			endpoint: "/v3/chat/conversations/online",
			data: {
				conversation
			}
		})

		return response
	}
}

export default ChatConversationsOnline
