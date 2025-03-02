import type APIClient from "../client"
import type { AuthVersion } from "../../types"

export type LoginResponse = {
	apiKey: string
	masterKeys: string | null
	publicKey: string | null
	privateKey: string | null
	dek: string | null
}

/**
 * Login
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class Login
 * @typedef {Login}
 */
export class Login {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of Login.
	 * @date 2/1/2024 - 3:19:15 PM
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
	 * Login. Send "XXXXXX" as the twoFactorCode when 2FA is disabled.
	 * @date 2/1/2024 - 3:10:59 PM
	 *
	 * @public
	 * @async
	 * @param {{ email: string, password: string, twoFactorCode: string, authVersion: AuthVersion }} param0
	 * @param {string} param0.email
	 * @param {string} param0.password
	 * @param {string} param0.twoFactorCode
	 * @param {AuthVersion} param0.authVersion
	 * @returns {Promise<LoginResponse>}
	 */
	public async fetch({
		email,
		password,
		twoFactorCode = "XXXXXX",
		authVersion
	}: {
		email: string
		password: string
		twoFactorCode?: string
		authVersion: AuthVersion
	}): Promise<LoginResponse> {
		const response = await this.apiClient.request<LoginResponse>({
			method: "POST",
			endpoint: "/v3/login",
			data: {
				email,
				password,
				twoFactorCode,
				authVersion
			}
		})

		return response
	}
}

export default Login
