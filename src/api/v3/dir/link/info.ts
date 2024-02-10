import type APIClient from "../../../client"

export type DirLinkInfoResponse = {
	parent: string
	metadata: string
	hasPassword: boolean
	salt: string
	timestamp: number
}

/**
 * DirLinkInfo
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirLinkInfo
 * @typedef {DirLinkInfo}
 */
export class DirLinkInfo {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirLinkInfo.
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
	 * Get public link info of a directory.
	 * @date 2/10/2024 - 12:46:07 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<DirLinkInfoResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<DirLinkInfoResponse> {
		const response = await this.apiClient.request<DirLinkInfoResponse>({
			method: "POST",
			endpoint: "/v3/dir/link/info",
			data: {
				uuid
			}
		})

		return response
	}
}

export default DirLinkInfo
