import type APIClient from "../../../../client"

/**
 * ItemSharedOutRemove
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ItemSharedOutRemove
 * @typedef {ItemSharedOutRemove}
 */
export class ItemSharedOutRemove {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ItemSharedOutRemove.
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
	 * Remove an item that you are sharing.
	 * @date 2/9/2024 - 7:48:27 PM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; receiverId: number; }} param0
	 * @param {string} param0.uuid
	 * @param {number} param0.receiverId
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid, receiverId }: { uuid: string; receiverId: number }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/item/shared/out/remove",
			data: {
				uuid,
				receiverId
			}
		})
	}
}

export default ItemSharedOutRemove
