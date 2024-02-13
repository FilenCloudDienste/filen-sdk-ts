import type APIClient from "../../client"

/**
 * ChatDelete
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatDelete
 * @typedef {ChatDelete}
 */
export class ChatDelete {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ChatDelete.
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
	 * Delete a chat conversation.
	 * @date 2/13/2024 - 5:19:07 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/chat/delete",
			data: {
				uuid
			}
		})
	}
}

export default ChatDelete
