import type APIClient from "../../client"

/**
 * UserAppearOffline
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserAppearOffline
 * @typedef {UserAppearOffline}
 */
export class UserAppearOffline {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserAppearOffline.
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
	 * Toggle appear offline status.
	 * @date 2/13/2024 - 6:10:56 AM
	 *
	 * @public
	 * @async
	 * @param {{ appearOffline: boolean }} param0
	 * @param {boolean} param0.appearOffline
	 * @returns {Promise<void>}
	 */
	public async fetch({ appearOffline }: { appearOffline: boolean }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/user/appearOffline",
			data: {
				appearOffline
			}
		})
	}
}

export default UserAppearOffline
