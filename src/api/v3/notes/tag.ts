import type APIClient from "../../client"

/**
 * NotesTag
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class NotesTag
 * @typedef {NotesTag}
 */
export class NotesTag {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of NotesTag.
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
	 * Tag a note.
	 * @date 2/13/2024 - 6:26:37 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; tag: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.tag
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid, tag }: { uuid: string; tag: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/notes/tag",
			data: {
				uuid,
				tag
			}
		})
	}
}

export default NotesTag
