import type APIClient from "../../../client"

/**
 * UserKeyPairUpdate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserKeyPairUpdate
 * @typedef {UserKeyPairUpdate}
 */
export class UserKeyPairUpdate {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserKeyPairUpdate.
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
	 * Update keypair.
	 * @date 2/20/2024 - 7:41:01 AM
	 *
	 * @public
	 * @async
	 * @param {{ publicKey: string, encryptedPrivateKey: string, apiKey?: string }} param0
	 * @param {string} param0.publicKey
	 * @param {string} param0.encryptedPrivateKey
	 * @param {string} param0.apiKey
	 * @returns {Promise<void>}
	 */
	public async fetch({
		publicKey,
		encryptedPrivateKey,
		apiKey
	}: {
		publicKey: string
		encryptedPrivateKey: string
		apiKey?: string
	}): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/user/keyPair/update",
			data: {
				publicKey,
				privateKey: encryptedPrivateKey
			},
			apiKey
		})
	}
}

export default UserKeyPairUpdate
