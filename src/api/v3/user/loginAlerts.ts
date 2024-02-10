import type APIClient from "../../client"

/**
 * UserLoginAlerts
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserLoginAlerts
 * @typedef {UserLoginAlerts}
 */
export class UserLoginAlerts {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserLoginAlerts.
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
	 * Toggle login alerts.
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
			endpoint: "/v3/user/loginAlerts",
			data: {
				enabled: enable ? 1 : 0
			}
		})
	}
}

export default UserLoginAlerts
