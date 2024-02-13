import type APIClient from "../../client"
import type { NoteTag } from "../notes"

export type NotesTagsResponse = NoteTag[]

/**
 * NotesTags
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class NotesTags
 * @typedef {NotesTags}
 */
export class NotesTags {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of NotesTags.
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
	 * Fetch all note tags.
	 * @date 2/13/2024 - 6:18:25 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<NotesTagsResponse>}
	 */
	public async fetch(): Promise<NotesTagsResponse> {
		const response = await this.apiClient.request<NotesTagsResponse>({
			method: "GET",
			endpoint: "/v3/notes/tags"
		})

		return response
	}
}

export default NotesTags
