import type APIClient from "../../client"
import { type FileEncryptionVersion } from "../../.."

export type SearchFindItem =
	| {
			uuid: string
			type: "file"
			parent: string
			metadata: string
			timestamp: number
			chunks: number
			size: number
			bucket: string
			region: string
			version: FileEncryptionVersion
			favorited: boolean
			trash: boolean
			versioned: boolean
			uuidPath: string[]
			metadataPath: string[]
	  }
	| {
			uuid: string
			type: "directory"
			parent: string
			metadata: string
			trash: boolean
			color: string | null
			timestamp: number
			favorited: boolean
			uuidPath: string[]
			metadataPath: string[]
	  }

export type SearchFindResponse = {
	items: SearchFindItem[]
}

/**
 * SearchFind
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class SearchFind
 * @typedef {SearchFind}
 */
export class SearchFind {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of SearchFind.
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
	 * Find items in the search index.
	 * @date 2/13/2024 - 5:54:05 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<SearchFindResponse>}
	 */
	public async fetch({ hashes }: { hashes: string[] }): Promise<SearchFindResponse> {
		const response = await this.apiClient.request<SearchFindResponse>({
			method: "POST",
			endpoint: "/v3/search/find",
			data: {
				hashes
			}
		})

		return response
	}
}

export default SearchFind
