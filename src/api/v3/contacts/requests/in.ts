import type APIClient from "../../../client"

export type ContactRequest = {
	uuid: string
	userId: number
	email: string
	avatar: string | null
	nickName: string
	timestamp: number
}

export type ContactsRequestsInResponse = ContactRequest[]

/**
 * ContactsRequestsIn
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsRequestsIn
 * @typedef {ContactsRequestsIn}
 */
export class ContactsRequestsIn {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ContactsRequestsIn.
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
	 * Fetch all incoming contact requests.
	 * @date 2/13/2024 - 5:56:16 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<ContactsRequestsInResponse>}
	 */
	public async fetch(): Promise<ContactsRequestsInResponse> {
		const response = await this.apiClient.request<ContactsRequestsInResponse>({
			method: "GET",
			endpoint: "/v3/contacts/requests/in"
		})

		return response
	}
}

export default ContactsRequestsIn
