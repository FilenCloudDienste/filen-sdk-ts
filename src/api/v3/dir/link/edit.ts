import type APIClient from "../../../client"
import { generateRandomString, deriveKeyFromPassword } from "../../../../crypto/utils"

export type DirLinkEditExpiration = "30d" | "14d" | "7d" | "3d" | "1d" | "6h" | "1h" | "never"

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
	 * @date 2/10/2024 - 1:14:26 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		expiration?: DirLinkEditExpiration
	 * 		password?: string
	 * 		downloadBtn?: boolean
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {DirLinkEditExpiration} [param0.expiration="never"]
	 * @param {string} param0.password
	 * @param {boolean} [param0.downloadBtn=true]
	 * @returns {Promise<void>}
	 */
	public async fetch({
		uuid,
		expiration = "never",
		password,
		downloadBtn = true
	}: {
		uuid: string
		expiration?: DirLinkEditExpiration
		password?: string
		downloadBtn?: boolean
	}): Promise<void> {
		const salt = await generateRandomString({ length: 32 })
		const pass = password && password.length > 0 ? "notempty" : "empty"
		const passHashed = password && password.length > 0 ? password : "empty"

		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/dir/link/edit",
			data: {
				uuid,
				expiration,
				password: pass,
				passwordHashed: await deriveKeyFromPassword({
					password: passHashed,
					salt,
					iterations: 200000,
					hash: "sha512",
					bitLength: 512,
					returnHex: true
				}),
				salt,
				downloadBtn: typeof downloadBtn === "boolean" ? downloadBtn : true
			}
		})
	}
}

export default DirLinkEdit
