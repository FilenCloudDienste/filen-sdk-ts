import type APIClient from "../../client"

export type ChatTypingType = "up" | "down"

/**
 * ChatTyping
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatTyping
 * @typedef {ChatTyping}
 */
export class ChatTyping {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ChatTyping.
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
	 * Send a typing event to a chat conversation.
	 * @date 2/13/2024 - 4:59:42 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		conversation: string
	 * 		type: ChatTypingType
	 * 	}} param0
	 * @param {string} param0.conversation
	 * @param {ChatTypingType} param0.type
	 * @returns {Promise<void>}
	 */
	public async fetch({ conversation, type }: { conversation: string; type: ChatTypingType }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/chat/typing",
			data: {
				conversation,
				type
			}
		})
	}
}

export default ChatTyping
