import type APIClient from "../../../client"

/**
 * ContactsBlockedDelete
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ContactsBlockedDelete
 * @typedef {ContactsBlockedDelete}
 */
export class ContactsBlockedDelete {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ContactsBlockedDelete.
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
	 * Unblock a contact.
	 * @date 2/13/2024 - 6:16:03 AM
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
			endpoint: "/v3/contacts/blocked/delete",
			data: {
				uuid
			}
		})
	}
}

export default ContactsBlockedDelete
