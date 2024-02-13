import type APIClient from "../../client"

/**
 * UserNickname
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserNickname
 * @typedef {UserNickname}
 */
export class UserNickname {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserNickname.
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
	 * Change nickname.
	 * @date 2/13/2024 - 6:09:23 AM
	 *
	 * @public
	 * @async
	 * @param {{ nickname: string }} param0
	 * @param {string} param0.nickname
	 * @returns {Promise<void>}
	 */
	public async fetch({ nickname }: { nickname: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/user/nickname",
			data: {
				nickname
			}
		})
	}
}

export default UserNickname
