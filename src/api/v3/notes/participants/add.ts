import type APIClient from "../../../client"

/**
 * NotesParticipantsAdd
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesParticipantsAdd
 * @typedef {NotesParticipantsAdd}
 */
export class NotesParticipantsAdd {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of NotesParticipantsAdd.
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
	 * Add a participant to a note.
	 * @date 2/19/2024 - 11:53:39 PM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; contactUUID: string; metadata: string; permissionsWrite: boolean }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.contactUUID
	 * @param {string} param0.metadata
	 * @param {boolean} param0.permissionsWrite
	 * @returns {Promise<void>}
	 */
	public async fetch({
		uuid,
		contactUUID,
		metadata,
		permissionsWrite
	}: {
		uuid: string
		contactUUID: string
		metadata: string
		permissionsWrite: boolean
	}): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/notes/participants/add",
			data: {
				uuid,
				contactUUID,
				metadata,
				permissionsWrite
			}
		})
	}
}

export default NotesParticipantsAdd
