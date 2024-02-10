import type APIClient from "../../client"

/**
 * FileRestore
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileRestore
 * @typedef {FileRestore}
 */
export class FileRestore {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of FileRestore.
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
	 * Restore a file from the trash bin.
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
			endpoint: "/v3/file/restore",
			data: {
				uuid
			}
		})
	}
}

export default FileRestore
