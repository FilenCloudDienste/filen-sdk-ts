import type APIClient from "../../client"
import type { FileEncryptionVersion } from "../../../types"

export type DirContentUpload = {
	uuid: string
	metadata: string
	rm: string
	timestamp: number
	chunks: number
	size: number
	bucket: string
	region: string
	parent: string
	version: FileEncryptionVersion
	favorited: 0 | 1
}

export type DirContentFolder = {
	uuid: string
	name: string
	parent: string
	color: string | null
	timestamp: number
	favorited: 0 | 1
	is_sync: 0 | 1
	is_default: 0 | 1
}

export type DirContentResponse = {
	uploads: DirContentUpload[]
	folders: DirContentFolder[]
}

/**
 * DirContent
 * @date 2/1/2024 - 3:22:32 AM
 *
 * @export
 * @class DirContent
 * @typedef {DirContent}
 */
export class DirContent {
	private readonly apiClient: APIClient

	public constructor({ apiClient }: { apiClient: APIClient }) {
		this.apiClient = apiClient
	}

	/**
	 * Returns all files and folders inside a folder.
	 * @date 2/1/2024 - 3:22:42 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<DirContentResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<DirContentResponse> {
		const response = await this.apiClient.request<DirContentResponse>({
			method: "POST",
			endpoint: "/v3/dir/content",
			data: {
				uuid
			}
		})

		return response
	}
}

export default DirContent
