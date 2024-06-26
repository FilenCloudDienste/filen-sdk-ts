import type APIClient from "../../client"
import { type UserEvent as UserEventType } from "./events"

export type UserEventResponse = UserEventType

/**
 * UserEvent
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserEvent
 * @typedef {UserEvent}
 */
export class UserEvent {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserEvent.
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
	 * Get event information.
	 * @date 2/10/2024 - 2:09:37 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<UserEventResponse>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<UserEventResponse> {
		const response = await this.apiClient.request<UserEventResponse>({
			method: "POST",
			endpoint: "/v3/user/event",
			data: {
				uuid
			}
		})

		return response
	}
}

export default UserEvent
