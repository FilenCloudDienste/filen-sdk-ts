import type APIClient from "../../../client"

/**
 * NotesTagsDelete
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class NotesTagsDelete
 * @typedef {NotesTagsDelete}
 */
export class NotesTagsDelete {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of NotesTagsDelete.
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
	 * Delete a note tag.
	 * @date 2/13/2024 - 6:23:19 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/notes/tags/delete",
			data: {
				uuid
			}
		})
	}
}

export default NotesTagsDelete
