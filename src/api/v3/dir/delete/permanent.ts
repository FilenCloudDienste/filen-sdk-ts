import type APIClient from "../../../client"

/**
 * DirDeletePermanent
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirDeletePermanent
 * @typedef {DirDeletePermanent}
 */
export class DirDeletePermanent {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirDeletePermanent.
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
	 * Delete a directory permanently.
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
			endpoint: "/v3/dir/delete/permanent",
			data: {
				uuid
			}
		})
	}
}

export default DirDeletePermanent
