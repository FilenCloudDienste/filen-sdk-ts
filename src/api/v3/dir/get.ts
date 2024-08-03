import type APIClient from "../../client"

export type DirGetResponse = {
	uuid: string
	nameEncrypted: string
	nameHashed: string
	parent: string
	trash: boolean
	favorited: boolean
	color: string | null
}

/**
 * DirGet
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirGet
 * @typedef {DirGet}
 */
export class DirGet {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirGet.
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
	 * Get dir info.
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<DirGetResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<DirGetResponse> {
		const response = await this.apiClient.request<DirGetResponse>({
			method: "POST",
			endpoint: "/v3/dir",
			data: {
				uuid
			}
		})

		return response
	}
}

export default DirGet
