import type APIClient from "../../client"
import { bufferToHash } from "../../../crypto/utils"

/**
 * UserAvatar
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserAvatar
 * @typedef {UserAvatar}
 */
export class UserAvatar {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserAvatar.
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
	 * Upload an avatar.
	 * @date 2/10/2024 - 1:36:56 AM
	 *
	 * @public
	 * @async
	 * @param {{ buffer: Buffer }} param0
	 * @param {Buffer} param0.buffer
	 * @returns {Promise<void>}
	 */
	public async fetch({ buffer }: { buffer: Buffer }): Promise<void> {
		const base64 = buffer.toString("base64")

		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/user/avatar",
			data: {
				avatar: base64,
				hash: await bufferToHash({ buffer: new TextEncoder().encode(base64), algorithm: "sha512" })
			}
		})
	}
}

export default UserAvatar
