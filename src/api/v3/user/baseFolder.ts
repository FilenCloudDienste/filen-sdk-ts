import type APIClient from "../../client"

export type UserBaseFolderResponse = {
	uuid: string
}

/**
 * UserBaseFolder
 * @date 2/1/2024 - 3:26:27 PM
 *
 * @export
 * @class UserBaseFolder
 * @typedef {UserBaseFolder}
 */
export class UserBaseFolder {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserBaseFolder.
	 * @date 2/1/2024 - 3:26:33 PM
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
	 * Fetch the user's base folder information.
	 * @date 2/1/2024 - 3:26:36 PM
	 *
	 * @public
	 * @async
	 * @returns {Promise<UserBaseFolderResponse>}
	 */
	public async fetch(): Promise<UserBaseFolderResponse> {
		const response = await this.apiClient.request<UserBaseFolderResponse>({
			method: "GET",
			endpoint: "/v3/user/baseFolder"
		})

		return response
	}
}

export default UserBaseFolder
