import type APIClient from "../../client"

/**
 * DirMetadata
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirMetadata
 * @typedef {DirMetadata}
 */
export class DirMetadata {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirMetadata.
	 * @date 2/14/2024 - 4:41:14 AM
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
	 * Change metadata of a directory.
	 * @date 2/14/2024 - 4:41:08 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		metadataEncrypted: string
	 * 		nameHashed: string
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.metadataEncrypted
	 * @param {string} param0.nameHashed
	 * @returns {Promise<void>}
	 */
	public async fetch({
		uuid,
		metadataEncrypted,
		nameHashed
	}: {
		uuid: string
		metadataEncrypted: string
		nameHashed: string
	}): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/dir/metadata",
			data: {
				uuid,
				name: metadataEncrypted,
				nameHashed
			}
		})
	}
}

export default DirMetadata
