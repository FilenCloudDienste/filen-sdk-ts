import type APIClient from "../../../client"
import { type ContactRequest } from "./in"

export type ContactsRequestsOutResponse = ContactRequest[]

/**
 * ContactsRequestsOut
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsRequestsOut
 * @typedef {ContactsRequestsOut}
 */
export class ContactsRequestsOut {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ContactsRequestsOut.
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
	 * Fetch all outgoing contact requests.
	 * @date 2/13/2024 - 6:00:33 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<ContactsRequestsOutResponse>}
	 */
	public async fetch(): Promise<ContactsRequestsOutResponse> {
		const response = await this.apiClient.request<ContactsRequestsOutResponse>({
			method: "GET",
			endpoint: "/v3/contacts/requests/out"
		})

		return response
	}
}

export default ContactsRequestsOut
