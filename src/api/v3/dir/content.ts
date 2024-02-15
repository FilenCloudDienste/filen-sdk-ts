import type APIClient from "../../client"
import type { FileEncryptionVersion } from "../../../types"
import type DirColor from "./color"

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
	color: DirColor
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

	/**
	 * Creates an instance of DirContent.
	 * @date 2/1/2024 - 3:19:31 PM
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
	 * Returns all files and folders inside a folder.
	 * Use "recents" as the UUID parameter to get the recently uploaded files.
	 * @date 2/1/2024 - 4:42:23 PM
	 *
	 * @public
	 * @async
	 * @param {({ uuid: string | "recents"; dirsOnly?: boolean })} param0
	 * @param {string} param0.uuid
	 * @param {boolean} [param0.dirsOnly=false]
	 * @returns {Promise<DirContentResponse>}
	 */
	public async fetch({ uuid, dirsOnly = false }: { uuid: string | "recents"; dirsOnly?: boolean }): Promise<DirContentResponse> {
		const response = await this.apiClient.request<DirContentResponse>({
			method: "POST",
			endpoint: "/v3/dir/content",
			data: {
				uuid,
				...(dirsOnly ? { foldersOnly: true } : {})
			}
		})

		return response
	}
}

export default DirContent
