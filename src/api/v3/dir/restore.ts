import type APIClient from "../../client"

/**
 * DirRestore
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirRestore
 * @typedef {DirRestore}
 */
export class DirRestore {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirRestore.
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
	 * Restore a directory from the trash bin.
	 * @date 2/9/2024 - 7:13:10 PM
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
			endpoint: "/v3/dir/restore",
			data: {
				uuid
			}
		})
	}
}

export default DirRestore
