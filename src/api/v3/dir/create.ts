import type APIClient from "../../client"
import { hashFn } from "../../../crypto/utils"
import type Crypto from "../../../crypto"
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
	private readonly crypto: Crypto

	/**
	 * Creates an instance of DirCreate.
	 * @date 2/9/2024 - 4:56:44 AM
	 *
	 * @constructor
	 * @public
	 * @param {{ apiClient: APIClient; crypto: Crypto }} param0
	 * @param {APIClient} param0.apiClient
	 * @param {Crypto} param0.crypto
	 */
	public constructor({ apiClient, crypto }: { apiClient: APIClient; crypto: Crypto }) {
		this.apiClient = apiClient
		this.crypto = crypto
	}

	/**
	 * Create a new folder.
	 * @date 2/9/2024 - 4:54:57 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid?: string, name: string; parent: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.name
	 * @param {string} param0.parent
	 * @returns {Promise<DirCreateResponse>}
	 */
	public async fetch({ uuid, name, parent }: { uuid?: string; name: string; parent: string }): Promise<DirCreateResponse> {
		const uuidToUse = uuid ? uuid : uuidv4()
		const [encrypted, nameHashed] = await Promise.all([
			this.crypto.encrypt().metadata({ metadata: JSON.stringify({ name }) }),
			hashFn({ input: name.toLowerCase() })
		])
		const response = await this.apiClient.request<DirCreateResponse>({
			method: "POST",
			endpoint: "/v3/dir/create",
			data: {
				uuid: uuidToUse,
				name: encrypted,
				nameHashed,
				parent
			}
		})

		// @TODO: checkIfItemParentIsShared

		return response
	}
}

export default DirCreate
