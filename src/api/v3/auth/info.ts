import type APIClient from "../../client"
import type { AuthVersion } from "../../../types"

export type AuthInfoResponse = {
	email: string
	authVersion: AuthVersion
	salt: string
}

/**
 * AuthInfo
 * @date 2/1/2024 - 3:23:04 AM
 *
 * @export
 * @class AuthInfo
 * @typedef {AuthInfo}
 */
export class AuthInfo {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of AuthInfo.
	 * @date 2/1/2024 - 3:19:19 PM
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
	 * Returns authentication info.
	 * @date 2/1/2024 - 3:23:14 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<AuthInfoResponse>}
	 */
	public async fetch({ email }: { email: string }): Promise<AuthInfoResponse> {
		const response = await this.apiClient.request<AuthInfoResponse>({
			method: "POST",
			endpoint: "/v3/auth/info",
			data: {
				email
			}
		})

		return response
	}
}

export default AuthInfo
