import type APIClient from "../../../client"

export type PaymentMethods = "paypal" | "stripe" | "crypto"

export type UserSubCreateResponse = {
	url: string
}

/**
 * UserSubCreate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserSubCreate
 * @typedef {UserSubCreate}
 */
export class UserSubCreate {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserSubCreate.
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
	 * Create a subscription payment flow.
	 * @date 2/10/2024 - 2:26:46 AM
	 *
	 * @public
	 * @async
	 * @param {{ planId: number, method: PaymentMethods }} param0
	 * @param {number} param0.planId
	 * @param {PaymentMethods} param0.method
	 * @returns {Promise<UserSubCreateResponse>}
	 */
	public async fetch({ planId, method }: { planId: number; method: PaymentMethods }): Promise<UserSubCreateResponse> {
		const response = await this.apiClient.request<UserSubCreateResponse>({
			method: "POST",
			endpoint: "/v3/user/sub/create",
			data: {
				planId,
				method: method
			}
		})

		return response
	}
}

export default UserSubCreate
