import type APIClient from "../../client"

/**
 * TrashEmpty
 * @date 2/9/2024 - 5:39:37 AM
 *
 * @export
 * @class TrashEmpty
 * @typedef {TrashEmpty}
 */
export class TrashEmpty {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of TrashEmpty.
	 * @date 2/9/2024 - 5:39:43 AM
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
	 * Empty the trash bin.
	 * @date 2/9/2024 - 5:41:49 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<void>}
	 */
	public async fetch(): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/trash/empty",
			data: {}
		})
	}
}

export default TrashEmpty
