import type APIClient from "../../client"

export type ChatMessage = {
	conversation: string
	uuid: string
	senderId: number
	senderEmail: string
	senderAvatar: string | null
	senderNickName: string
	message: string
	replyTo: {
		uuid: string
		senderId: number
		senderEmail: string
		senderAvatar: string
		senderNickName: string
		message: string
	}
	embedDisabled: boolean
	edited: boolean
	editedTimestamp: number
	sentTimestamp: number
}

/**
 * ChatMessages
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatMessages
 * @typedef {ChatMessages}
 */
export class ChatMessages {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ChatMessages.
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
	 * Fetch chat messages from the given timestamp ordered DESC. Can be used for pagination.
	 * @date 2/13/2024 - 4:47:29 AM
	 *
	 * @public
	 * @async
	 * @param {{conversation: string, timestamp?: number}} param0
	 * @param {string} param0.conversation
	 * @param {number} [param0.timestamp=Date.now() + 3600000]
	 * @returns {Promise<ChatMessage[]>}
	 */
	public async fetch({
		conversation,
		timestamp = Date.now() + 3600000
	}: {
		conversation: string
		timestamp?: number
	}): Promise<ChatMessage[]> {
		const response = await this.apiClient.request<ChatMessage[]>({
			method: "POST",
			endpoint: "/v3/chat/messages",
			data: {
				conversation,
				timestamp
			}
		})

		return response
	}
}

export default ChatMessages
