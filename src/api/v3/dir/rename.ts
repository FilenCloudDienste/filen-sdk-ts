import type APIClient from "../../client"
import type Crypto from "../../../crypto"
import { hashFn } from "../../../crypto/utils"

/**
 * DirRename
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirRename
 * @typedef {DirRename}
 */
export class DirRename {
	private readonly apiClient: APIClient
	private readonly crypto: Crypto

	/**
	 * Creates an instance of DirRename.
	 * @date 2/9/2024 - 5:10:15 AM
	 *
	 * @constructor
	 * @public
	 * @param {{ apiClient: APIClient, crypto: Crypto }} param0
	 * @param {APIClient} param0.apiClient
	 * @param {Crypto} param0.crypto
	 */
	public constructor({ apiClient, crypto }: { apiClient: APIClient; crypto: Crypto }) {
		this.apiClient = apiClient
		this.crypto = crypto
	}

	/**
	 * Rename a directory.
	 * @date 2/9/2024 - 5:16:43 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; name: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.name
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid, name }: { uuid: string; name: string }): Promise<void> {
		const [nameHashed, encrypted] = await Promise.all([
			hashFn({ input: name.toLowerCase() }),
			this.crypto.encrypt().metadata({
				metadata: JSON.stringify({
					name
				})
			})
		])

		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/dir/rename",
			data: {
				uuid,
				name: encrypted,
				nameHashed
			}
		})

		// @TODO: checkIfItemIsSharedForRename
	}
}

export default DirRename
