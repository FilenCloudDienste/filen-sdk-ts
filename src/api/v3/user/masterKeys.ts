import type APIClient from "../../client"

export type UserMasterKeysResponse = {
	keys: string
}

/**
 * UserMasterKeys
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserMasterKeys
 * @typedef {UserMasterKeys}
 */
export class UserMasterKeys {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserMasterKeys.
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
	 * Update master keys.
	 * @date 2/20/2024 - 7:43:35 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		encryptedMasterKeys: string
	 * 		apiKey?: string
	 * 	}} param0
	 * @param {string} param0.encryptedMasterKeys
	 * @param {string} param0.apiKey
	 * @returns {Promise<UserMasterKeysResponse>}
	 */
	public async fetch({ encryptedMasterKeys, apiKey }: { encryptedMasterKeys: string; apiKey?: string }): Promise<UserMasterKeysResponse> {
		const response = await this.apiClient.request<UserMasterKeysResponse>({
			method: "POST",
			endpoint: "/v3/user/masterKeys",
			data: {
				masterKeys: encryptedMasterKeys
			},
			apiKey
		})

		return response
	}
}

export default UserMasterKeys
