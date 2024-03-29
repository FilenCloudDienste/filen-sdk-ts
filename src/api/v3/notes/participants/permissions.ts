import type APIClient from "../../../client"

/**
 * NotesParticipantsPermissions
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesParticipantsPermissions
 * @typedef {NotesParticipantsPermissions}
 */
export class NotesParticipantsPermissions {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of NotesParticipantsPermissions.
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
	 * Change permissions of a note participant.
	 * @date 2/13/2024 - 5:52:06 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; userId: number, permissionsWrite: boolean }} param0
	 * @param {string} param0.uuid
	 * @param {number} param0.userId
	 * @param {boolean} param0.permissionsWrite
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid, userId, permissionsWrite }: { uuid: string; userId: number; permissionsWrite: boolean }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/notes/participants/permissions",
			data: {
				uuid,
				userId,
				permissionsWrite
			}
		})
	}
}

export default NotesParticipantsPermissions
