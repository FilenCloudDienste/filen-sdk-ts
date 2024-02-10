import type APIClient from "../../../../client"

/**
 * ItemSharedInRemove
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ItemSharedInRemove
 * @typedef {ItemSharedInRemove}
 */
export class ItemSharedInRemove {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ItemSharedInRemove.
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
	 * Remove an item that has been shared with you.
	 * @date 2/9/2024 - 7:49:19 PM
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
			endpoint: "/v3/item/shared/in/remove",
			data: {
				uuid
			}
		})
	}
}

export default ItemSharedInRemove
