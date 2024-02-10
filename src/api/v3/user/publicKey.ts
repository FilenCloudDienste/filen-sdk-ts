import type APIClient from "../../client"

export type UserPublicKeyResponse = {
	publicKey: string
}

/**
 * UserPublicKey
 * @date 2/1/2024 - 3:18:55 PM
 *
 * @export
 * @class UserPublicKey
 * @typedef {UserPublicKey}
 */
export class UserPublicKey {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserPublicKey.
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
	 * Get a user's public key.
	 * @date 2/9/2024 - 7:22:21 PM
	 *
	 * @public
	 * @async
	 * @param {{email:string}} param0
	 * @param {string} param0.email
	 * @returns {Promise<UserPublicKeyResponse>}
	 */
	public async fetch({ email }: { email: string }): Promise<UserPublicKeyResponse> {
		const response = await this.apiClient.request<UserPublicKeyResponse>({
			method: "POST",
			endpoint: "/v3/user/publicKey",
			data: {
				email
			}
		})

		return response
	}
}

export default UserPublicKey
