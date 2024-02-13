import type APIClient from "../../../client"

/**
 * ChatConversationsCreate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsCreate
 * @typedef {ChatConversationsCreate}
 */
export class ChatConversationsCreate {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ChatConversationsCreate.
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
	 * Create a chat conversation.
	 * @date 2/13/2024 - 4:55:01 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string, metadata: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.metadata
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid, metadata }: { uuid: string; metadata: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/chat/conversations/create",
			data: {
				uuid,
				metadata
			}
		})
	}
}

export default ChatConversationsCreate
