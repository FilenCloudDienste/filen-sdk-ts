import type APIClient from "../../client"

/**
 * Health
 * @date 2/1/2024 - 3:23:04 AM
 *
 * @export
 * @class Health
 * @typedef {Health}
 */
export class Health {
	private readonly apiClient: APIClient

	public constructor({ apiClient }: { apiClient: APIClient }) {
		this.apiClient = apiClient
	}

	/**
	 * Returns "OK" when API is healthy.
	 * @date 2/1/2024 - 3:23:14 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<"OK">}
	 */
	public async fetch(): Promise<"OK"> {
		const response = await this.apiClient.request<"OK">({
			method: "GET",
			endpoint: "/v3/health"
		})

		return response
	}
}

export default Health
