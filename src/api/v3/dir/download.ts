import type APIClient from "../../client"
import { type FileEncryptionVersion } from "../../../types"
import { argon2id } from "../../../crypto/utils"

export type DirDownloadFile = {
	uuid: string
	bucket: string
	region: string
	name?: string
	size?: string
	mime?: string
	chunks: number
	parent: string
	metadata: string
	version: FileEncryptionVersion
	chunksSize?: number
	timestamp?: number
	nameHashed?: string
	favorited?: boolean
}

export type DirDownloadFolder = {
	uuid: string
	name: string
	parent: string | "base"
	timestamp?: number
	nameHashed?: string
	favorited?: boolean
	color?: string | null
}

export type DirDownloadResponse = {
	files: DirDownloadFile[]
	folders: DirDownloadFolder[]
}

export type DirDownloadType = "normal" | "shared" | "linked"

/**
 * DirDownload
 * @date 2/1/2024 - 6:04:48 PM
 *
 * @export
 * @class DirDownload
 * @typedef {DirDownload}
 */
export class DirDownload {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirDownload.
	 * @date 2/1/2024 - 6:04:54 PM
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
	 * Download directory contents recursively in one call. Supports normal, shared and linked directories.
	 * @date 2/22/2024 - 1:45:11 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		type?: DirDownloadType
	 * 		linkUUID?: string
	 * 		linkHasPassword?: boolean
	 * 		linkPassword?: string
	 * 		linkSalt?: string
	 * 		skipCache?: boolean
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {DirDownloadType} [param0.type="normal"]
	 * @param {string} param0.linkUUID
	 * @param {boolean} param0.linkHasPassword
	 * @param {string} param0.linkPassword
	 * @param {string} param0.linkSalt
	 * @param {boolean} param0.skipCache
	 * @returns {Promise<DirDownloadResponse>}
	 */
	public async fetch({
		uuid,
		type = "normal",
		linkUUID,
		linkHasPassword,
		linkPassword,
		linkSalt,
		skipCache
	}: {
		uuid: string
		type?: DirDownloadType
		linkUUID?: string
		linkHasPassword?: boolean
		linkPassword?: string
		linkSalt?: string
		skipCache?: boolean
	}): Promise<DirDownloadResponse> {
		const endpoint = type === "shared" ? "/v3/dir/download/shared" : type === "linked" ? "/v3/dir/download/link" : "/v3/dir/download"

		const data =
			type === "shared" || type === "normal"
				? {
						uuid,
						...(skipCache
							? {
									skipCache
							  }
							: {})
				  }
				: {
						uuid: linkUUID,
						parent: uuid,
						password:
							linkHasPassword && linkSalt && linkPassword
								? linkSalt.length === 512
									? (
											await argon2id(Buffer.from(linkPassword, "utf-8"), Buffer.from(linkSalt, "hex"), {
												t: 3,
												m: 65536,
												p: 4,
												version: 0x13,
												dkLen: 64
											})
									  ).toString("hex")
									: linkSalt.length === 32
									? await this.apiClient.sdk.getWorker().crypto.utils.deriveKeyFromPassword({
											password: linkPassword,
											salt: linkSalt,
											iterations: 200000,
											hash: "sha512",
											bitLength: 512,
											returnHex: true
									  })
									: await this.apiClient.sdk.getWorker().crypto.utils.hashFn({
											input: linkPassword.length === 0 ? "empty" : linkPassword
									  })
								: await this.apiClient.sdk.getWorker().crypto.utils.hashFn({
										input: "empty"
								  }),
						...(skipCache
							? {
									skipCache
							  }
							: {})
				  }

		const response = await this.apiClient.request<DirDownloadResponse>({
			method: "POST",
			endpoint,
			data
		})

		return response
	}
}

export default DirDownload
