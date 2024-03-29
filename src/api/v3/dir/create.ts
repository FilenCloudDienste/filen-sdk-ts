import type APIClient from "../../client"
import { uuidv4 } from "../../../utils"

export type DirCreateResponse = {
	uuid: string
}

/**
 * DirCreate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirCreate
 * @typedef {DirCreate}
 */
export class DirCreate {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirCreate.
	 * @date 2/14/2024 - 4:35:07 AM
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
	 * Create a new folder.
	 * @date 2/14/2024 - 4:35:02 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid?: string; metadataEncrypted: string; parent: string, nameHashed: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.metadataEncrypted
	 * @param {string} param0.parent
	 * @param {string} param0.nameHashed
	 * @returns {Promise<DirCreateResponse>}
	 */
	public async fetch({
		uuid,
		metadataEncrypted,
		parent,
		nameHashed
	}: {
		uuid?: string
		metadataEncrypted: string
		parent: string
		nameHashed: string
	}): Promise<DirCreateResponse> {
		const uuidToUse = uuid ? uuid : await uuidv4()
		const response = await this.apiClient.request<DirCreateResponse>({
			method: "POST",
			endpoint: "/v3/dir/create",
			data: {
				uuid: uuidToUse,
				name: metadataEncrypted,
				nameHashed,
				parent
			}
		})

		return response
	}
}

export default DirCreate
