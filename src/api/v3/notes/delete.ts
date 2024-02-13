import type APIClient from "../../client"

/**
 * NotesDelete
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesDelete
 * @typedef {NotesDelete}
 */
export class NotesDelete {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of NotesDelete.
	 * @date 2/1/2024 - 3:19:15 PM
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
	 * Delete a note.
	 * @date 2/13/2024 - 5:31:43 AM
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
			endpoint: "/v3/notes/delete",
			data: {
				uuid
			}
		})
	}
}

export default NotesDelete
