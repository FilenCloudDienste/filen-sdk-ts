import type APIClient from "../../../../client"
import type { AuthVersion } from "../../../../../types"

export type UserSettingsPasswordChangeResponse = {
	newAPIKey: string
}

/**
 * UserSettingsPasswordChange
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserSettingsPasswordChange
 * @typedef {UserSettingsPasswordChange}
 */
export class UserSettingsPasswordChange {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserSettingsPasswordChange.
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
	 * Change password. Requires derived hashed current && new password. Master keys are in encrypted form.
	 * @date 2/10/2024 - 1:56:33 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 *         password: string
	 *         currentPassword: string
	 *         authVersion: AuthVersion
	 *         salt: string
	 *         masterKeys: string
	 *     }} param0
	 * @param {string} param0.password
	 * @param {string} param0.currentPassword
	 * @param {AuthVersion} param0.authVersion
	 * @param {string} param0.salt
	 * @param {string} param0.masterKeys
	 * @returns {Promise<UserSettingsPasswordChangeResponse>}
	 */
	public async fetch({
		password,
		currentPassword,
		authVersion,
		salt,
		masterKeys
	}: {
		password: string
		currentPassword: string
		authVersion: AuthVersion
		salt: string
		masterKeys: string
	}): Promise<UserSettingsPasswordChangeResponse> {
		const response = await this.apiClient.request<UserSettingsPasswordChangeResponse>({
			method: "POST",
			endpoint: "/v3/user/settings/password/change",
			data: {
				password,
				currentPassword,
				authVersion,
				salt,
				masterKeys
			}
		})

		return response
	}
}

export default UserSettingsPasswordChange
