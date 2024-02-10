import type APIClient from "../../../client"

export type FileLinkPasswordResponse = {
	hasPassword: boolean
	salt: string
}

/**
 * FileLinkPassword
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileLinkPassword
 * @typedef {FileLinkPassword}
 */
export class FileLinkPassword {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of FileLinkPassword.
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
	 * Check if a file public link is password protected.
	 * @date 2/10/2024 - 2:15:06 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<FileLinkPasswordResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<FileLinkPasswordResponse> {
		const response = await this.apiClient.request<FileLinkPasswordResponse>({
			method: "POST",
			endpoint: "/v3/file/link/password",
			data: {
				uuid
			}
		})

		return response
	}
}

export default FileLinkPassword
