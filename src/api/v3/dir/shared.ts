import type APIClient from "../../client"

export type DirSharedUser = {
	email: string
	publicKey: string
}

export type DirSharedResponse = {
	sharing: boolean
	users: DirSharedUser[]
}

/**
 * DirShared
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirShared
 * @typedef {DirShared}
 */
export class DirShared {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirShared.
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
	 * Returns sharing information about a directory.
	 * @date 2/1/2024 - 8:16:46 PM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<DirSharedResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<DirSharedResponse> {
		const response = await this.apiClient.request<DirSharedResponse>({
			method: "POST",
			endpoint: "/v3/dir/shared",
			data: {
				uuid
			}
		})

		return response
	}
}

export default DirShared
