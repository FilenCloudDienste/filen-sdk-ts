import type APIClient from "../../../client"

/**
 * ItemSharedRename
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ItemSharedRename
 * @typedef {ItemSharedRename}
 */
export class ItemSharedRename {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ItemSharedRename.
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
	 * Rename a shared item.
	 * @date 2/9/2024 - 4:39:59 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; receiverId: number; metadata: string }} param0
	 * @param {string} param0.uuid
	 * @param {number} param0.receiverId
	 * @param {string} param0.metadata
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid, receiverId, metadata }: { uuid: string; receiverId: number; metadata: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/item/shared/rename",
			data: {
				uuid,
				receiverId,
				metadata
			}
		})
	}
}

export default ItemSharedRename
