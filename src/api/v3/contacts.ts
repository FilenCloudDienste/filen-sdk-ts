import type APIClient from "../client"

export type Contact = {
	uuid: string
	userId: number
	email: string
	avatar: string | null
	nickName: string
	lastActive: number
	timestamp: number
}

export type ContactsResponse = Contact[]

/**
 * Contacts
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class Contacts
 * @typedef {Contacts}
 */
export class Contacts {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of Contacts.
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
	 * Fetch all contacts.
	 * @date 2/13/2024 - 5:54:05 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<ContactsResponse>}
	 */
	public async fetch(): Promise<ContactsResponse> {
		const response = await this.apiClient.request<ContactsResponse>({
			method: "GET",
			endpoint: "/v3/contacts"
		})

		return response
	}
}

export default Contacts
