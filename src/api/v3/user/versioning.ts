import type APIClient from "../../client"

/**
 * UserVersioning
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserVersioning
 * @typedef {UserVersioning}
 */
export class UserVersioning {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserVersioning.
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
	 * Toggle file versioning.
	 * @date 2/10/2024 - 2:31:30 AM
	 *
	 * @public
	 * @async
	 * @param {{ enable: boolean }} param0
	 * @param {boolean} param0.enable
	 * @returns {Promise<void>}
	 */
	public async fetch({ enable }: { enable: boolean }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/user/versioning",
			data: {
				enabled: enable ? 1 : 0
			}
		})
	}
}

export default UserVersioning
