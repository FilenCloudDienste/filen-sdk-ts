import type APIClient from "../../../client"
import type { DirColors } from "../color"

export type DirLinkContentResponse = {
	folders: {
		color: DirColors | null
		metadata: string
		parent: string
		timestamp: number
		uuid: string
	}[]
	files: {
		bucket: string
		chunks: number
		metadata: string
		parent: string
		region: string
		size: number
		timestamp: number
		uuid: string
		version: number
	}[]
}

/**
 * DirLinkContent
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirLinkContent
 * @typedef {DirLinkContent}
 */
export class DirLinkContent {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirLinkContent.
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
	 * Get contents of a directory public link.
	 * @date 2/10/2024 - 2:20:01 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string, password: string, parent: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.password
	 * @param {string} param0.parent
	 * @returns {Promise<DirLinkContentResponse>}
	 */
	public async fetch({ uuid, password, parent }: { uuid: string; password: string; parent: string }): Promise<DirLinkContentResponse> {
		const response = await this.apiClient.request<DirLinkContentResponse>({
			method: "POST",
			endpoint: "/v3/dir/link/content",
			data: {
				uuid,
				password,
				parent
			}
		})

		return response
	}
}

export default DirLinkContent
