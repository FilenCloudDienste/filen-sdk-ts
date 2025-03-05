import type APIClient from "../../client"
import { type FileEncryptionVersion } from "../../../types"

export type UploadEmptyResponse = {
	chunks: number
	size: number
}

/**
 * UploadEmpty
 * @date 2/1/2024 - 4:45:26 PM
 *
 * @export
 * @class UploadEmpty
 * @typedef {UploadEmpty}
 */
export class UploadEmpty {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UploadEmpty.
	 * @date 2/1/2024 - 4:45:31 PM
	 *
	 * @constructor
	 * @public
	 * @param {{ apiClient: APIClient }} param0
	 * @param {APIClient} param0.apiClient
	 */
	public constructor({ apiClient }: { apiClient: APIClient }) {
		this.apiClient = apiClient
	}

	public async fetch({
		uuid,
		name,
		nameHashed,
		size,
		parent,
		mime,
		metadata,
		version
	}: {
		uuid: string
		name: string
		nameHashed: string
		size: string
		parent: string
		mime: string
		metadata: string
		version: FileEncryptionVersion
	}): Promise<UploadEmptyResponse> {
		const response = await this.apiClient.request<UploadEmptyResponse>({
			method: "POST",
			endpoint: "/v3/upload/empty",
			data: {
				uuid,
				name,
				nameHashed,
				size,
				parent,
				mime,
				metadata,
				version
			}
		})

		return response
	}
}

export default UploadEmpty
