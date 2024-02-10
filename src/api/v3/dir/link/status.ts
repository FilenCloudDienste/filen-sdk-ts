import type APIClient from "../../../client"

export type DirLinkStatusResponse =
	| {
			exists: false
	  }
	| {
			exists: true
			uuid: string
			key: string
			expiration: number
			expirationText: string
			downloadBtn: 0 | 1
			password: string | null
	  }

/**
 * DirLinkStatus
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirLinkStatus
 * @typedef {DirLinkStatus}
 */
export class DirLinkStatus {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirLinkStatus.
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
	 * Get public link status of a directory.
	 * @date 2/10/2024 - 12:46:07 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<DirLinkStatusResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<DirLinkStatusResponse> {
		const response = await this.apiClient.request<DirLinkStatusResponse>({
			method: "POST",
			endpoint: "/v3/dir/link/status",
			data: {
				uuid
			}
		})

		return response
	}
}

export default DirLinkStatus
