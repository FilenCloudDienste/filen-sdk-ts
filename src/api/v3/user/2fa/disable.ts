import type APIClient from "../../../client"

/**
 * User2FADisable
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class User2FADisable
 * @typedef {User2FADisable}
 */
export class User2FADisable {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of User2FADisable.
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
	 * Disable 2FA.
	 * @date 2/10/2024 - 1:59:21 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		code: string
	 * 	}} param0
	 * @param {string} param0.code
	 * @returns {Promise<void>}
	 */
	public async fetch({ code }: { code: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/user/2fa/disable",
			data: {
				code
			}
		})
	}
}

export default User2FADisable
