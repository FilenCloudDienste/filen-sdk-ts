import type APIClient from "../../../client"

/**
 * FileVersionRestore
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileVersionRestore
 * @typedef {FileVersionRestore}
 */
export class FileVersionRestore {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of FileVersionRestore.
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
	 * Restore an old file version.
	 * @date 2/9/2024 - 7:19:29 PM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; currentUUID: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.currentUUID
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid, currentUUID }: { uuid: string; currentUUID: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/file/version/restore",
			data: {
				uuid,
				current: currentUUID
			}
		})
	}
}

export default FileVersionRestore
