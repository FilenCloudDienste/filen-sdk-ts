import type APIClient from "../../client"

/**
 * DirMove
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirMove
 * @typedef {DirMove}
 */
export class DirMove {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirMove.
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
	 * Move a directory.
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
			endpoint: "/v3/dir/move",
			data: {
				uuid,
				to
			}
		})

		// @TODO: checkIfItemParentIsShared
	}
}

export default DirMove
