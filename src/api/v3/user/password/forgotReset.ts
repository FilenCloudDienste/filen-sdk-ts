import type APIClient from "../../../client"

/**
 * UserPasswordForgotReset
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class UserPasswordForgotReset
 * @typedef {UserPasswordForgotReset}
 */
export class UserPasswordForgotReset {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserPasswordForgotReset.
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
	 * Reset password.
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		token: string
	 * 		password: string
	 * 		authVersion: number
	 * 		salt: string
	 * 		hasRecoveryKeys: boolean
	 * 		newMasterKeys: string
	 * 	}} param0
	 * @param {string} param0.token
	 * @param {string} param0.password
	 * @param {number} param0.authVersion
	 * @param {string} param0.salt
	 * @param {boolean} param0.hasRecoveryKeys
	 * @param {string} param0.newMasterKeys
	 * @returns {Promise<void>}
	 */
	public async fetch({
		token,
		password,
		authVersion,
		salt,
		hasRecoveryKeys,
		newMasterKeys
	}: {
		token: string
		password: string
		authVersion: number
		salt: string
		hasRecoveryKeys: boolean
		newMasterKeys: string
	}): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/user/password/forgot",
			data: {
				token,
				password,
				authVersion,
				salt,
				hasRecoveryKeys,
				newMasterKeys
			}
		})
	}
}

export default UserPasswordForgotReset
