import type APIClient from "../../client"

/**
 * UserSetDEK
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserSetDEK
 * @typedef {UserSetDEK}
 */
export class UserSetDEK {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserSetDEK.
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

	public async fetch({ encryptedDEK, apiKey }: { encryptedDEK: string; apiKey?: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/user/dek",
			apiKey,
			data: {
				dek: encryptedDEK
			}
		})
	}
}

export default UserSetDEK
