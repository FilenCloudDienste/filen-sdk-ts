import type APIClient from "../../../client"
import type { PublicLinkExpiration } from "../../../../types"

/**
 * DirLinkEdit
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirLinkEdit
 * @typedef {DirLinkEdit}
 */
export class DirLinkEdit {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirLinkEdit.
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
	 * Edit a directory public link.
	 * @date 2/19/2024 - 4:52:28 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		expiration: PublicLinkExpiration
	 * 		password: string
	 * 		downloadBtn: boolean
	 * 		passwordHashed: string
	 * 		salt: string
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {PublicLinkExpiration} [param0.expiration="never"]
	 * @param {string} param0.password
	 * @param {boolean} [param0.downloadBtn=true]
	 * @param {string} param0.passwordHashed
	 * @param {string} param0.salt
	 * @returns {Promise<void>}
	 */
	public async fetch({
		uuid,
		expiration = "never",
		password,
		downloadBtn = true,
		passwordHashed,
		salt
	}: {
		uuid: string
		expiration: PublicLinkExpiration
		password: string
		downloadBtn: boolean
		passwordHashed: string
		salt: string
	}): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/dir/link/edit",
			data: {
				uuid,
				expiration,
				password,
				passwordHashed,
				salt,
				downloadBtn
			}
		})
	}
}

export default DirLinkEdit
