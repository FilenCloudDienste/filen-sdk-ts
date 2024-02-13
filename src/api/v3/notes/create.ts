import type APIClient from "../../client"

/**
 * NotesCreate
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesCreate
 * @typedef {NotesCreate}
 */
export class NotesCreate {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of NotesCreate.
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
	 * Create a note.
	 * @date 2/13/2024 - 5:26:26 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string, title: string, metadata: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.title
	 * @param {string} param0.metadata
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid, title, metadata }: { uuid: string; title: string; metadata: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/notes/create",
			data: {
				uuid,
				title,
				metadata
			}
		})
	}
}

export default NotesCreate
