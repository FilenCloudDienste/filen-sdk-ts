import type APIClient from "../../../client"

/**
 * NotesParticipantsRemove
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesParticipantsRemove
 * @typedef {NotesParticipantsRemove}
 */
export class NotesParticipantsRemove {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of NotesParticipantsRemove.
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
	 * Remove a participant from a note.
	 * @date 2/13/2024 - 5:50:29 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; userId: number }} param0
	 * @param {string} param0.uuid
	 * @param {number} param0.userId
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid, userId }: { uuid: string; userId: number }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/notes/participants/remove",
			data: {
				uuid,
				userId
			}
		})
	}
}

export default NotesParticipantsRemove
