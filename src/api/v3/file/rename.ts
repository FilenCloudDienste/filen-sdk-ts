import type APIClient from "../../client"
import type Crypto from "../../../crypto"
import { hashFn } from "../../../crypto/utils"
import type { FileMetadata } from "../../../types"

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
	private readonly crypto: Crypto

	/**
	 * Creates an instance of FileRename.
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
	 * Rename a file.
	 * @date 2/9/2024 - 5:16:16 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; metadata: FileMetadata; name: string }} param0
	 * @param {string} param0.uuid
	 * @param {FileMetadata} param0.metadata
	 * @param {string} param0.name
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid, metadata, name }: { uuid: string; metadata: FileMetadata; name: string }): Promise<void> {
		const [nameHashed, encrypted, encryptedName] = await Promise.all([
			hashFn({ input: name.toLowerCase() }),
			this.crypto.encrypt().metadata({
				metadata: JSON.stringify({
					...metadata,
					name
				})
			}),
			this.crypto.encrypt().metadata({ metadata: name, key: metadata.key })
		])

		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/file/rename",
			data: {
				uuid,
				name: encryptedName,
				nameHashed,
				metadata: encrypted
			}
		})

		// @TODO: checkIfItemIsSharedForRename
	}
}

export default FileRename
