import type APIClient from "../../client"

export type DirSharedLink = {
	linkUUID: string
	linkKey: string
}

export type DirLinkedResponse = {
	link: boolean
	links: DirSharedLink[]
}

/**
 * DirLinked
 * @date 2/1/2024 - 8:21:05 PM
 *
 * @export
 * @class DirLinked
 * @typedef {DirLinked}
 */
export class DirLinked {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirLinked.
	 * @date 2/1/2024 - 8:21:11 PM
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
	 * Returns public link information about a directory.
	 * @date 2/1/2024 - 8:21:37 PM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<DirLinkedResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<DirLinkedResponse> {
		const response = await this.apiClient.request<DirLinkedResponse>({
			method: "POST",
			endpoint: "/v3/dir/linked",
			data: {
				uuid
			}
		})

		return response
	}
}

export default DirLinked
