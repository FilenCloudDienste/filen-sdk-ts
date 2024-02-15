import type APIClient from "../../client"

/**
 * FileRename
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileRename
 * @typedef {FileRename}
 */
export class FileRename {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of FileRename.
	 * @date 2/14/2024 - 4:40:52 AM
	 *
	 * @constructor
	 * @public
	 * @param {{ apiClient: APIClient; }} param0
	 * @param {APIClient} param0.apiClient
	 */
	public constructor({ apiClient }: { apiClient: APIClient }) {
		this.apiClient = apiClient
	}

	/**
	 * Rename a file.
	 * @date 2/14/2024 - 4:40:39 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; metadataEncrypted: string; nameEncrypted: string, nameHashed: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.metadataEncrypted
	 * @param {string} param0.nameEncrypted
	 * @param {string} param0.nameHashed
	 * @returns {Promise<void>}
	 */
	public async fetch({
		uuid,
		metadataEncrypted,
		nameEncrypted,
		nameHashed
	}: {
		uuid: string
		metadataEncrypted: string
		nameEncrypted: string
		nameHashed: string
	}): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/file/rename",
			data: {
				uuid,
				name: nameEncrypted,
				nameHashed,
				metadata: metadataEncrypted
			}
		})

		// @TODO: checkIfItemIsSharedForRename
	}
}

export default FileRename
