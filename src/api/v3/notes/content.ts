import type APIClient from "../../client"
import { type NoteType } from "../notes"

export type NoteContent = {
	preview: string
	content: string
	editedTimestamp: number
	editorId: number
	type: NoteType
}

export type NotesContentResponse = NoteContent

/**
 * NotesContent
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesContent
 * @typedef {NotesContent}
 */
export class NotesContent {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of NotesContent.
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
	 * Fetch note content.
	 * @date 2/13/2024 - 5:24:20 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<NotesContentResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<NotesContentResponse> {
		const response = await this.apiClient.request<NotesContentResponse>({
			method: "POST",
			endpoint: "/v3/notes/content",
			data: {
				uuid
			}
		})

		return response
	}
}

export default NotesContent
