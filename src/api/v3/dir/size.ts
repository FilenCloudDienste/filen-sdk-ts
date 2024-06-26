import type APIClient from "../../client"

export type DirSizeResponse = {
	size: number
	folders: number
	files: number
}

/**
 * DirSize
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirSize
 * @typedef {DirSize}
 */
export class DirSize {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirSize.
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
	 * Get the size of a directory.
	 * @date 2/9/2024 - 5:33:34 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; sharerId?: number, receiverId?: number, trash?: boolean }} param0
	 * @param {string} param0.uuid
	 * @param {number} [param0.sharerId= 0]
	 * @param {number} [param0.receiverId= 0]
	 * @param {boolean} [param0.trash=false]
	 * @returns {Promise<DirSizeResponse>}
	 */
	public async fetch({
		uuid,
		sharerId = 0,
		receiverId = 0,
		trash = false
	}: {
		uuid: string
		sharerId?: number
		receiverId?: number
		trash?: boolean
	}): Promise<DirSizeResponse> {
		const response = await this.apiClient.request<DirSizeResponse>({
			method: "POST",
			endpoint: "/v3/dir/size",
			data: {
				uuid,
				sharerId,
				receiverId,
				trash: trash ? 1 : 0
			}
		})

		return response
	}
}

export default DirSize
