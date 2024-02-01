import type APIClient from "../../client"
import { FileEncryptionVersion } from "../../../types"

export type SharedOutUpload = {
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

export type SharedOutFolder = {
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

export type SharedOutResponse = {
	uploads: SharedOutUpload[]
	folders: SharedOutFolder[]
}

/**
 * SharedOut
 * @date 2/1/2024 - 4:19:58 PM
 *
 * @export
 * @class SharedOut
 * @typedef {SharedOut}
 */
export class SharedOut {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of SharedOut.
	 * @date 2/1/2024 - 4:20:03 PM
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
	 * Fetch shared files and folders based on the given UUID and receiverId.
	 * @date 2/1/2024 - 4:26:07 PM
	 *
	 * @public
	 * @async
	 * @param {?{ uuid?: string; receiverId?: number }} [params]
	 * @returns {Promise<SharedOutResponse>}
	 */
	public async fetch(params?: { uuid?: string; receiverId?: number }): Promise<SharedOutResponse> {
		const response = await this.apiClient.request<SharedOutResponse>({
			method: "POST",
			endpoint: "/v3/shared/out",
			data: {
				uuid: params ? params.uuid : "shared-out",
				receiverId: params ? params.receiverId : 0
			}
		})

		return response
	}
}

export default SharedOut
