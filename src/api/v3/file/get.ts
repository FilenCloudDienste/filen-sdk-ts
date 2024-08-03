import type APIClient from "../../client"
import { type FileEncryptionVersion } from "../../../types"

export type FileGetResponse = {
	uuid: string
	region: string
	bucket: string
	nameEncrypted: string
	nameHashed: string
	sizeEncrypted: string
	mimeEncrypted: string
	metadata: string
	size: number
	parent: string
	versioned: boolean
	trash: boolean
	version: FileEncryptionVersion
}

/**
 * FileGet
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileGet
 * @typedef {FileGet}
 */
export class FileGet {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of FileGet.
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
	 * Get file info.
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<FileGetResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<FileGetResponse> {
		const response = await this.apiClient.request<FileGetResponse>({
			method: "POST",
			endpoint: "/v3/file",
			data: {
				uuid
			}
		})

		return response
	}
}

export default FileGet
