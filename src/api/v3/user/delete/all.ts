import type APIClient from "../../../client"

/**
 * UserDeleteAll
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserDeleteAll
 * @typedef {UserDeleteAll}
 */
export class UserDeleteAll {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserDeleteAll.
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
	 * Delete all files and directories.
	 * @date 2/10/2024 - 1:50:50 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<void>}
	 */
	public async fetch(): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/user/delete/all",
			data: {}
		})
	}
}

export default UserDeleteAll
