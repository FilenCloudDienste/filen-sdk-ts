import type APIClient from "../../client"

export type FilePresentResponse = {
	present: boolean
	versioned: boolean
	trash: boolean
}

/**
 * FilePresent
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FilePresent
 * @typedef {FilePresent}
 */
export class FilePresent {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of FilePresent.
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
	 * Check if a file is present.
	 * @date 2/9/2024 - 4:59:21 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<FilePresentResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<FilePresentResponse> {
		const response = await this.apiClient.request<FilePresentResponse>({
			method: "POST",
			endpoint: "/v3/file/present",
			data: {
				uuid
			}
		})

		return response
	}
}

export default FilePresent
