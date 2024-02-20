import type APIClient from "../../client"

export type UserInfoResponse = {
	id: number
	email: string
	isPremium: 0 | 1
	maxStorage: number
	storageUsed: number
	avatarURL: string
	baseFolderUUID: string
}

/**
 * UserInfo
 * @date 2/1/2024 - 3:18:55 PM
 *
 * @export
 * @class UserInfo
 * @typedef {UserInfo}
 */
export class UserInfo {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserInfo.
	 * @date 2/1/2024 - 3:19:01 PM
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
	 * Fetch user info.
	 * @date 2/1/2024 - 3:19:04 PM
	 *
	 * @public
	 * @async
	 * @returns {Promise<UserInfoResponse>}
	 */
	public async fetch({ apiKey }: { apiKey?: string }): Promise<UserInfoResponse> {
		const response = await this.apiClient.request<UserInfoResponse>({
			method: "GET",
			endpoint: "/v3/user/info",
			apiKey
		})

		return response
	}
}

export default UserInfo
