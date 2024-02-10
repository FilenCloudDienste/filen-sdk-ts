import type APIClient from "../../client"

/**
 * DirTrash
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirTrash
 * @typedef {DirTrash}
 */
export class DirTrash {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirTrash.
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
	 * Move a directory to the trash bin.
	 * @date 2/9/2024 - 4:59:21 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<DirPresentResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/dir/trash",
			data: {
				uuid
			}
		})
	}
}

export default DirTrash
