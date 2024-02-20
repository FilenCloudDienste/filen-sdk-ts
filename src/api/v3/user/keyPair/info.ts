import type APIClient from "../../../client"

export type UserKeyPairInfoResponse = { publicKey: string; privateKey: string }

/**
 * UserKeyPairInfo
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserKeyPairInfo
 * @typedef {UserKeyPairInfo}
 */
export class UserKeyPairInfo {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserKeyPairInfo.
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
	 * Get keypair info.
	 * @date 2/20/2024 - 7:42:40 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		apiKey?: string
	 * 	}} param0
	 * @param {string} [param0.apiKey=undefined]
	 * @returns {Promise<UserKeyPairInfoResponse>}
	 */
	public async fetch({ apiKey = undefined }: { apiKey?: string }): Promise<UserKeyPairInfoResponse> {
		const response = await this.apiClient.request<UserKeyPairInfoResponse>({
			method: "GET",
			endpoint: "/v3/user/keyPair/info",
			apiKey
		})

		return response
	}
}

export default UserKeyPairInfo
