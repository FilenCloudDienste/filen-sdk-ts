import type APIClient from "../../../../client"

/**
 * ChatConversationsNameEdit
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatConversationsNameEdit
 * @typedef {ChatConversationsNameEdit}
 */
export class ChatConversationsNameEdit {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ChatConversationsNameEdit.
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
	 * Edit conversation name.
	 * @date 2/13/2024 - 4:49:46 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, name: string}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.name
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid, name }: { uuid: string; name: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/chat/conversations/name/edit",
			data: {
				uuid,
				name
			}
		})
	}
}

export default ChatConversationsNameEdit
