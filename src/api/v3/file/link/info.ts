import type APIClient from "../../../client"
import { type FileEncryptionVersion } from "../../../../types"

export type FileLinkInfoResponse = {
	bucket: string
	chunks: number
	downloadBtn: boolean
	mime: string
	name: string
	password: string | null
	region: string
	size: string
	timestamp: number
	uuid: string
	version: FileEncryptionVersion
}

/**
 * FileLinkInfo
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileLinkInfo
 * @typedef {FileLinkInfo}
 */
export class FileLinkInfo {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of FileLinkInfo.
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
	 * Get file public link info.
	 * @date 2/10/2024 - 2:13:05 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string, password: string }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.password
	 * @returns {Promise<FileLinkInfoResponse>}
	 */
	public async fetch({ uuid, password }: { uuid: string; password: string }): Promise<FileLinkInfoResponse> {
		const response = await this.apiClient.request<FileLinkInfoResponse>({
			method: "POST",
			endpoint: "/v3/file/link/info",
			data: {
				uuid,
				password
			}
		})

		return response
	}
}

export default FileLinkInfo
