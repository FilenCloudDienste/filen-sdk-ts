import type APIClient from "../../../client"

/**
 * UserLastActiveDesktop
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserLastActiveDesktop
 * @typedef {UserLastActiveDesktop}
 */
export class UserLastActiveDesktop {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserLastActiveDesktop.
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
	 * Update last active timestamp for the desktop platform.
	 * @date 2/13/2024 - 6:44:14 AM
	 *
	 * @public
	 * @async
	 * @param {{ timestamp: number }} param0
	 * @param {number} param0.timestamp
	 * @returns {Promise<void>}
	 */
	public async fetch({ timestamp }: { timestamp: number }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/user/lastActive/desktop",
			data: {
				timestamp
			}
		})
	}
}

export default UserLastActiveDesktop
