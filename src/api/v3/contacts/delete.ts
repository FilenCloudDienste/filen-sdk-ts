import type APIClient from "../../client"

/**
 * ContactsDelete
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsDelete
 * @typedef {ContactsDelete}
 */
export class ContactsDelete {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ContactsDelete.
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
	 * Delete a contact.
	 * @date 2/13/2024 - 6:07:40 AM
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
			endpoint: "/v3/contacts/delete",
			data: {
				uuid
			}
		})
	}
}

export default ContactsDelete
