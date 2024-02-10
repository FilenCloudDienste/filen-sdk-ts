import type APIClient from "../../client"

/**
 * ItemShare
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ItemShare
 * @typedef {ItemShare}
 */
export class ItemShare {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ItemShare.
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
	 * Share an item.
	 * @date 2/9/2024 - 4:27:13 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; parent: string; email: string; type: string; metadata: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.parent
	 * @param {string} param0.email
	 * @param {string} param0.type
	 * @param {string} param0.metadata
	 * @returns {Promise<void>}
	 */
	public async fetch({
		uuid,
		parent,
		email,
		type,
		metadata
	}: {
		uuid: string
		parent: string
		email: string
		type: string
		metadata: string
	}): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/item/share",
			data: {
				uuid,
				parent,
				email,
				type,
				metadata
			}
		})
	}
}

export default ItemShare
