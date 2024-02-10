import type APIClient from "../../client"

export type UserEvent = {
	id: number
	info: {
		ip: string
		userAgent: string
	}
	timestamp: number
	type: string
	uuid: string
}

export type UserEventsResponse = {
	events: UserEvent[]
}

/**
 * UserEvents
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserEvents
 * @typedef {UserEvents}
 */
export class UserEvents {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserEvents.
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
	 * Get user account events.
	 * @date 2/10/2024 - 2:06:14 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		lastTimestamp?: number
	 * 		filter?: string
	 * 	}} param0
	 * @param {number} [param0.lastTimestamp=Math.floor(Date.now() / 1000) + 60]
	 * @param {string} [param0.filter="all"]
	 * @returns {Promise<UserEvent[]>}
	 */
	public async fetch({
		lastTimestamp = Math.floor(Date.now() / 1000) + 60,
		filter = "all"
	}: {
		lastTimestamp?: number
		filter?: string
	}): Promise<UserEvent[]> {
		const response = await this.apiClient.request<UserEventsResponse>({
			method: "POST",
			endpoint: "/v3/user/events",
			data: {
				filter,
				timestamp: lastTimestamp
			}
		})

		return response.events
	}
}

export default UserEvents
