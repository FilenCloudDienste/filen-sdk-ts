import type APIClient from "../../../client"

/**
 * NotesTagsFavorite
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class NotesTagsFavorite
 * @typedef {NotesTagsFavorite}
 */
export class NotesTagsFavorite {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of NotesTagsFavorite.
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
	 * Toggle the favorite status of a note tag.
	 * @date 2/13/2024 - 6:24:56 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string, favorite: boolean }} param0
	 * @param {string} param0.uuid
	 * @param {boolean} param0.favorite
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid, favorite }: { uuid: string; favorite: boolean }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/notes/tags/favorite",
			data: {
				uuid,
				favorite
			}
		})
	}
}

export default NotesTagsFavorite
