import type APIClient from "../../../client"

/**
 * UserSubCancel
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserSubCancel
 * @typedef {UserSubCancel}
 */
export class UserSubCancel {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserSubCancel.
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
	 * Cancel a subscription.
	 * @date 2/10/2024 - 2:21:56 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/user/sub/cancel",
			data: {
				uuid
			}
		})
	}
}

export default UserSubCancel
