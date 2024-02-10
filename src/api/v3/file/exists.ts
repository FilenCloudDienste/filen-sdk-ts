import type APIClient from "../../client"
import { hashFn } from "../../../crypto/utils"

export type FileExistsResponse =
	| {
			exists: false
			existsUUID?: string
	  }
	| {
			exists: true
			existsUUID: string
	  }

/**
 * FileExists
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileExists
 * @typedef {FileExists}
 */
export class FileExists {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of FileExists.
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
	 * Check if a directory already exists.
	 * @date 2/9/2024 - 4:44:34 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 *         name: string
	 *         parent: string
	 *     }} param0
	 * @param {string} param0.name
	 * @param {string} param0.parent
	 * @returns {Promise<DirExistsResponse>}
	 */
	public async fetch({ name, parent }: { name: string; parent: string }): Promise<FileExistsResponse> {
		const response = await this.apiClient.request<FileExistsResponse>({
			method: "POST",
			endpoint: "/v3/file/exists",
			data: {
				parent,
				nameHashed: await hashFn({ input: name.toLowerCase() })
			}
		})

		return response
	}
}

export default FileExists
