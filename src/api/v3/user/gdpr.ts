import type APIClient from "../../client"

export type UserGDPRResponse = {
	user: {
		email: string
		lastActiveUnixTimestamp: 1706353169
		lastActiveChatUnixTimestamp: 1706353169
		lastIPAddress: string
		nickName: string | null
		personal: {
			firstName: string | null
			lastName: string | null
			companyName: string | null
			vatId: string | null
			street: string | null
			streetNumber: string | null
			city: string | null
			postalCode: string | null
			country: string | null
		}
	}
	events: {
		ipAddresses: string[]
		userAgents: string[]
	}
}

/**
 * UserGDPR
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserGDPR
 * @typedef {UserGDPR}
 */
export class UserGDPR {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserGDPR.
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
	 * Get the user's GDPR info.
	 * @date 2/10/2024 - 1:23:53 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<UserGDPRResponse>}
	 */
	public async fetch(): Promise<UserGDPRResponse> {
		const response = await this.apiClient.request<UserGDPRResponse>({
			method: "GET",
			endpoint: "/v3/user/gdpr"
		})

		return response
	}
}

export default UserGDPR
