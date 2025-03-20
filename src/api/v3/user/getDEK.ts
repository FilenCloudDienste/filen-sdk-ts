import type APIClient from "../../client"

export type UserGetDEKResponse = {
	dek: string | null
}

/**
 * UserGetDEK
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserGetDEK
 * @typedef {UserGetDEK}
 */
export class UserGetDEK {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserGetDEK.
	 * @date 2/14/2024 - 4:40:52 AM
	 *
	 * @constructor
	 * @public
	 * @param {{ apiClient: APIClient; }} param0
	 * @param {APIClient} param0.apiClient
	 */
	public constructor({ apiClient }: { apiClient: APIClient }) {
		this.apiClient = apiClient
	}

	public async fetch(params?: { apiKey?: string }): Promise<UserGetDEKResponse> {
		return await this.apiClient.request<UserGetDEKResponse>({
			method: "GET",
			endpoint: "/v3/user/dek",
			apiKey: params?.apiKey
		})
	}
}

export default UserGetDEK
