import type APIClient from "../../../../client"

export type ContactsRequestsInCountResponse = number

/**
 * ContactsRequestsInCount
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsRequestsInCount
 * @typedef {ContactsRequestsInCount}
 */
export class ContactsRequestsInCount {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ContactsRequestsInCount.
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
	 * Fetch count of incoming contact requests.
	 * @date 2/13/2024 - 5:58:45 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<ContactsRequestsInCountResponse>}
	 */
	public async fetch(): Promise<ContactsRequestsInCountResponse> {
		const response = await this.apiClient.request<ContactsRequestsInCountResponse>({
			method: "GET",
			endpoint: "/v3/contacts/requests/in/count"
		})

		return response
	}
}

export default ContactsRequestsInCount
