import type APIClient from "../../client"

/**
 * UserAvatar
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserAvatar
 * @typedef {UserAvatar}
 */
export class UserAvatar {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserAvatar.
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
	 * Upload an avatar.
	 * @date 2/20/2024 - 6:45:34 AM
	 *
	 * @public
	 * @async
	 * @param {{ base64: string, hash: string }} param0
	 * @param {string} param0.base64
	 * @param {string} param0.hash
	 * @returns {Promise<void>}
	 */
	public async fetch({ base64, hash }: { base64: string; hash: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/user/avatar",
			data: {
				avatar: base64,
				hash
			}
		})
	}
}

export default UserAvatar
