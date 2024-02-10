import type APIClient from "../../client"

export type ItemLinkedLink = {
	linkUUID: string
	linkKey: string
}

export type ItemLinkedResponse = {
	link: boolean
	links: ItemLinkedLink[]
}

/**
 * ItemLinked
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ItemLinked
 * @typedef {ItemLinked}
 */
export class ItemLinked {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ItemLinked.
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
	 * Get public link information about an item.
	 * @date 2/9/2024 - 4:30:58 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<ItemLinkedResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<ItemLinkedResponse> {
		const response = await this.apiClient.request<ItemLinkedResponse>({
			method: "POST",
			endpoint: "/v3/item/linked",
			data: {
				uuid
			}
		})

		return response
	}
}

export default ItemLinked
