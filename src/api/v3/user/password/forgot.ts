import type APIClient from "../../../client"

/**
 * UserPasswordForgot
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class UserPasswordForgot
 * @typedef {UserPasswordForgot}
 */
export class UserPasswordForgot {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserPasswordForgot.
	 * @date 2/1/2024 - 3:19:15 PM
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
	 * Send password reset instruction email.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		email: string
	 * 	}} param0
	 * @param {string} param0.email
	 * @returns {Promise<void>}
	 */
	public async fetch({ email }: { email: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/user/password/forgot",
			data: {
				email
			}
		})
	}
}

export default UserPasswordForgot
