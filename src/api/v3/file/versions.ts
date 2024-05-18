import type APIClient from "../../client"

export type FileVersion = {
	bucket: string
	chunks: number
	metadata: string
	region: string
	rm: string
	timestamp: number
	uuid: string
	version: number
}

export type FileVersionsResponse = {
	versions: FileVersion[]
}

/**
 * FileVersions
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileVersions
 * @typedef {FileVersions}
 */
export class FileVersions {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of FileVersions.
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
	 * Get all versions of a file.
	 * @date 2/10/2024 - 1:17:28 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<FileVersionsResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<FileVersionsResponse> {
		const response = await this.apiClient.request<FileVersionsResponse>({
			method: "POST",
			endpoint: "/v3/file/versions",
			data: {
				uuid
			}
		})

		return response
	}
}

export default FileVersions
