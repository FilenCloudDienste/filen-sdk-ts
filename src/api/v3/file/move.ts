import type APIClient from "../../client"

/**
 * FileMove
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileMove
 * @typedef {FileMove}
 */
export class FileMove {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of FileMove.
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
	 * Move a file.
	 * @date 2/9/2024 - 5:06:42 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string, to: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.to
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid, to }: { uuid: string; to: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/file/move",
			data: {
				uuid,
				to
			}
		})
	}
}

export default FileMove
