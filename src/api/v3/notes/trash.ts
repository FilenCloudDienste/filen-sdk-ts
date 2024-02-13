import type APIClient from "../../client"

/**
 * NotesTrash
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesTrash
 * @typedef {NotesTrash}
 */
export class NotesTrash {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of NotesTrash.
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
	 * Trash a note.
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
			endpoint: "/v3/notes/trash",
			data: {
				uuid
			}
		})
	}
}

export default NotesTrash
