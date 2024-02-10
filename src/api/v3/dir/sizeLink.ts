import type APIClient from "../../client"

export type DirSizeLinkResponse = {
	size: number
}

/**
 * DirSizeLink
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirSizeLink
 * @typedef {DirSizeLink}
 */
export class DirSizeLink {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirSizeLink.
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
	 * Get the size of a directory inside a public link.
	 * @date 2/9/2024 - 5:36:04 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; linkUUID: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.linkUUID
	 * @returns {Promise<DirSizeLinkResponse>}
	 */
	public async fetch({ uuid, linkUUID }: { uuid: string; linkUUID: string }): Promise<DirSizeLinkResponse> {
		const response = await this.apiClient.request<DirSizeLinkResponse>({
			method: "POST",
			endpoint: "/v3/dir/size/link",
			data: {
				uuid,
				linkUUID
			}
		})

		return response
	}
}

export default DirSizeLink
