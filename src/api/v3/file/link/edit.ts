import type APIClient from "../../../client"
import { generateRandomString, hashFn, deriveKeyFromPassword } from "../../../../crypto/utils"

export type FileLinkEditExpiration = "30d" | "14d" | "7d" | "3d" | "1d" | "6h" | "1h" | "never"

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
	 * @date 2/10/2024 - 1:08:07 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 		fileUUID: string
	 * 		expiration?: FileLinkEditExpiration
	 * 		password?: string
	 * 		downloadBtn?: boolean
	 * 		type: "enable" | "disable" | "edit"
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.fileUUID
	 * @param {FileLinkEditExpiration} [param0.expiration="never"]
	 * @param {string} param0.password
	 * @param {boolean} [param0.downloadBtn=true]
	 * @param {("enable" | "disable" | "edit")} param0.type
	 * @returns {Promise<void>}
	 */
	public async fetch({
		uuid,
		fileUUID,
		expiration = "never",
		password,
		downloadBtn = true,
		type
	}: {
		uuid: string
		fileUUID: string
		expiration?: FileLinkEditExpiration
		password?: string
		downloadBtn?: boolean
		type: "enable" | "disable" | "edit"
	}): Promise<void> {
		const salt = await generateRandomString({ length: 32 })

		if (type === "enable") {
			await this.apiClient.request({
				method: "POST",
				endpoint: "/v3/file/link/edit",
				data: {
					uuid,
					fileUUID,
					expiration: "never",
					password: "empty",
					passwordHashed: await hashFn({ input: "empty" }),
					salt,
					downloadBtn: true,
					type: "enable"
				}
			})
		} else if (type === "disable") {
			await this.apiClient.request({
				method: "POST",
				endpoint: "/v3/file/link/edit",
				data: {
					uuid,
					fileUUID,
					expiration: "never",
					password: "empty",
					passwordHashed: await hashFn({ input: "empty" }),
					salt,
					downloadBtn: true,
					type: "disable"
				}
			})
		} else if (type === "edit") {
			const pass = password && password.length > 0 ? "notempty" : "empty"
			const passHashed = password && password.length > 0 ? password : "empty"

			await this.apiClient.request({
				method: "POST",
				endpoint: "/v3/file/link/edit",
				data: {
					uuid,
					fileUUID,
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
					downloadBtn: typeof downloadBtn === "boolean" ? downloadBtn : true,
					type: "enable"
				}
			})
		}
	}
}

export default FileLinkEdit
