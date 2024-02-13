import type APIClient from "../../client"

/**
 * NotesPinned
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesPinned
 * @typedef {NotesPinned}
 */
export class NotesPinned {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of NotesPinned.
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
	 * Toggle the pinned status of a note.
	 * @date 2/13/2024 - 5:40:57 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string, pinned: boolean }} param0
	 * @param {string} param0.uuid
	 * @param {boolean} param0.pinned
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid, pinned }: { uuid: string; pinned: boolean }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/notes/pinned",
			data: {
				uuid,
				pinned
			}
		})
	}
}

export default NotesPinned
