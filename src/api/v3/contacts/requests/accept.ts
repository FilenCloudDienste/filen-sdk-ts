import type APIClient from "../../../client"

/**
 * ContactsRequestsAccept
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsRequestsAccept
 * @typedef {ContactsRequestsAccept}
 */
export class ContactsRequestsAccept {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ContactsRequestsAccept.
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
	 * Accept a contact request.
	 * @date 2/13/2024 - 6:04:55 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid }: { uuid: string }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/contacts/requests/accept",
			data: {
				uuid
			}
		})
	}
}

export default ContactsRequestsAccept
