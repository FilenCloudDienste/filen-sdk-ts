import type APIClient from "../../client"

export type SearchAddItem = {
	type: "file" | "directory"
	hash: string
	uuid: string
}

export type SearchAddResponse = {
	added: number
	skipped: number
}

/**
 * SearchAdd
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class SearchAdd
 * @typedef {SearchAdd}
 */
export class SearchAdd {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of SearchAdd.
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
	 * Add items to the search index.
	 * @date 2/13/2024 - 5:54:05 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<SearchAddResponse>}
	 */
	public async fetch({ items }: { items: SearchAddItem[] }): Promise<SearchAddResponse> {
		const response = await this.apiClient.request<SearchAddResponse>({
			method: "POST",
			endpoint: "/v3/search/add",
			data: {
				items
			}
		})

		return response
	}
}

export default SearchAdd
