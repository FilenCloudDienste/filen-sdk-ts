import type APIClient from "../../client"
import { FileEncryptionVersion } from "../../../types"

export type SharedInUpload = {
	uuid: string
	parent: string
	metadata: string
	type: "file" | "folder"
	bucket: string
	region: string
	chunks: number
	size: number
	version: FileEncryptionVersion
	sharerEmail: string
	sharerId: number
	receiverEmail: null | string
	receiverId: null | number
	writeAccess: 0 | 1
	timestamp: number
}

export type SharedInFolder = {
	uuid: string
	parent: string | null
	metadata: string
	type: "folder" | "file"
	bucket: null
	region: null
	chunks: null
	sharerEmail: string
	sharerId: number
	receiverEmail: null | string
	receiverId: null | number
	writeAccess: 0 | 1
	color: string | null
	timestamp: number
	is_sync: 0 | 1
	is_default: 0 | 1
}

export type SharedInResponse = {
	uploads: SharedInUpload[]
	folders: SharedInFolder[]
}

/**
 * SharedIn
 * @date 2/1/2024 - 4:04:02 PM
 *
 * @export
 * @class SharedIn
 * @typedef {SharedIn}
 */
export class SharedIn {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of SharedIn.
	 * @date 2/1/2024 - 4:04:08 PM
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
	 * Fetch files and folder shared to the user based on the parent UUID (Use "shared-in" for the base parent).
	 * @date 2/1/2024 - 4:04:11 PM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<SharedInResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<SharedInResponse> {
		const response = await this.apiClient.request<SharedInResponse>({
			method: "POST",
			endpoint: "/v3/shared/in",
			data: {
				uuid
			}
		})

		return response
	}
}

export default SharedIn
