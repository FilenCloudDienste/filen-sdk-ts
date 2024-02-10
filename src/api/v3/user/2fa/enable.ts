import type APIClient from "../../../client"

export type User2FAEnableResponse = {
	recoveryKeys: string
}

/**
 * User2FAEnable
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class User2FAEnable
 * @typedef {User2FAEnable}
 */
export class User2FAEnable {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of User2FAEnable.
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
	 * Enable 2FA.
	 * @date 2/10/2024 - 1:59:21 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		code: string
	 * 	}} param0
	 * @param {string} param0.code
	 * @returns {Promise<User2FAEnableResponse>}
	 */
	public async fetch({ code }: { code: string }): Promise<User2FAEnableResponse> {
		const response = await this.apiClient.request<User2FAEnableResponse>({
			method: "POST",
			endpoint: "/v3/user/2fa/enable",
			data: {
				code
			}
		})

		return response
	}
}

export default User2FAEnable
