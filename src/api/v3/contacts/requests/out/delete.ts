import type APIClient from "../../../../client"

/**
 * ContactsRequestsOutDelete
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsRequestsOutDelete
 * @typedef {ContactsRequestsOutDelete}
 */
export class ContactsRequestsOutDelete {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ContactsRequestsOutDelete.
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
	 * Delete an outgoing contact request.
	 * @date 2/13/2024 - 6:02:09 AM
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
			endpoint: "/v3/contacts/requests/out/delete",
			data: {
				uuid
			}
		})
	}
}

export default ContactsRequestsOutDelete
