import type APIClient from "../../client"

/**
 * ChatSend
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatSend
 * @typedef {ChatSend}
 */
export class ChatSend {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ChatSend.
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
	 * Send a chat message.
	 * @date 2/13/2024 - 4:52:10 AM
	 *
	 * @public
	 * @async
	 * @param {{ conversation: string, uuid:string, message: string, replyTo: string }} param0
	 * @param {string} param0.conversation
	 * @param {string} param0.uuid
	 * @param {string} param0.message
	 * @param {string} param0.replyTo
	 * @returns {Promise<void>}
	 */
	public async fetch({
		conversation,
		uuid,
		message,
		replyTo
	}: {
		conversation: string
		uuid: string
		message: string
		replyTo: string
	}): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/chat/send",
			data: {
				conversation,
				uuid,
				message,
				replyTo
			}
		})
	}
}

export default ChatSend
