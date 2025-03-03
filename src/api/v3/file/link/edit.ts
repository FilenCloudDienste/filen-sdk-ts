import type APIClient from "../../../client"
import { type PublicLinkExpiration } from "../../../../types"

/**
 * FileLinkEdit
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileLinkEdit
 * @typedef {FileLinkEdit}
 */
export class FileLinkEdit {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of FileLinkEdit.
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
	 * Enable/disable/edit a file's public link.
	 * @date 2/19/2024 - 4:45:17 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		fileUUID: string
	 * 		expiration: PublicLinkExpiration
	 * 		password: string
	 * 		passwordHashed: string
	 * 		downloadBtn: boolean
	 * 		type: "enable" | "disable"
	 * 		salt: string
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.fileUUID
	 * @param {PublicLinkExpiration} [param0.expiration="never"]
	 * @param {string} param0.password
	 * @param {boolean} [param0.downloadBtn=true]
	 * @param {("enable" | "disable")} param0.type
	 * @param {string} param0.passwordHashed
	 * @param {string} param0.salt
	 * @returns {Promise<void>}
	 */
	public async fetch({
		uuid,
		fileUUID,
		expiration = "never",
		password,
		downloadBtn = true,
		type,
		passwordHashed,
		salt
	}: {
		uuid: string
		fileUUID: string
		expiration: PublicLinkExpiration
		password: string
		passwordHashed: string
		downloadBtn: boolean
		type: "enable" | "disable"
		salt: string
	}): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/file/link/edit",
			data: {
				uuid,
				fileUUID,
				expiration,
				password,
				passwordHashed,
				salt,
				downloadBtn,
				type
			}
		})
	}
}

export default FileLinkEdit
