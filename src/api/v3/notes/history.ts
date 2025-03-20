import type APIClient from "../../client"
import { type NoteType } from "../notes"

export type NoteHistory = {
	id: number
	preview: string
	content: string
	editedTimestamp: number
	editorId: number
	type: NoteType
}

export type NotesHistoryResponse = NoteHistory[]

/**
 * NotesHistory
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesHistory
 * @typedef {NotesHistory}
 */
export class NotesHistory {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of NotesHistory.
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
	 * Fetch a note's history.
	 * @date 2/13/2024 - 5:43:55 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<NotesHistoryResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<NotesHistoryResponse> {
		const response = await this.apiClient.request<NotesHistoryResponse>({
			method: "POST",
			endpoint: "/v3/notes/history",
			data: {
				uuid
			}
		})

		return response
	}
}

export default NotesHistory
