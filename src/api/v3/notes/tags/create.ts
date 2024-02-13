import type APIClient from "../../../client"

export type NotesTagsCreateResponse = {
	uuid: string
}

/**
 * NotesTagsCreate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class NotesTagsCreate
 * @typedef {NotesTagsCreate}
 */
export class NotesTagsCreate {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of NotesTagsCreate.
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
	 * Create a note tag.
	 * @date 2/13/2024 - 6:20:19 AM
	 *
	 * @public
	 * @async
	 * @param {{ name: string }} param0
	 * @param {string} param0.name
	 * @returns {Promise<NotesTagsCreateResponse>}
	 */
	public async fetch({ name }: { name: string }): Promise<NotesTagsCreateResponse> {
		const response = await this.apiClient.request<NotesTagsCreateResponse>({
			method: "POST",
			endpoint: "/v3/notes/tags/create",
			data: {
				name
			}
		})

		return response
	}
}

export default NotesTagsCreate
