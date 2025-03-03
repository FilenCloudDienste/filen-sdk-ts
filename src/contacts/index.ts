import { type Contact } from "../api/v3/contacts"
import { type BlockedContact } from "../api/v3/contacts/blocked"
import { type ContactRequest } from "../api/v3/contacts/requests/in"
import type FilenSDK from ".."

/**
 * Contacts
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class Contacts
 * @typedef {Contacts}
 */
export class Contacts {
	private readonly sdk: FilenSDK

	public constructor(sdk: FilenSDK) {
		this.sdk = sdk
	}

	/**
	 * Fetch all contacts.
	 * @date 2/20/2024 - 6:28:41 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<Contact[]>}
	 */
	public async all(): Promise<Contact[]> {
		return await this.sdk.api(3).contacts().all()
	}

	/**
	 * Fetch all incoming contact requests.
	 * @date 2/20/2024 - 6:29:43 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<ContactRequest[]>}
	 */
	public async incomingRequests(): Promise<ContactRequest[]> {
		return await this.sdk.api(3).contacts().requestsIn()
	}

	/**
	 * Fetch count of all incoming contact requests.
	 * @date 2/20/2024 - 6:30:11 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<number>}
	 */
	public async incomingRequestsCount(): Promise<number> {
		return await this.sdk.api(3).contacts().requestsInCount()
	}

	/**
	 * Fetch all outgoing contact requests.
	 * @date 2/20/2024 - 6:29:43 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<ContactRequest[]>}
	 */
	public async outgoingRequests(): Promise<ContactRequest[]> {
		return await this.sdk.api(3).contacts().requestsOut()
	}

	/**
	 * Delete an outgoing contact request.
	 * @date 2/20/2024 - 6:36:39 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async deleteOutgoingRequest({ uuid }: { uuid: string }): Promise<void> {
		await this.sdk.api(3).contacts().requestsOutDelete({
			uuid
		})
	}

	/**
	 * Send a contact request.
	 * @date 2/20/2024 - 6:36:33 AM
	 *
	 * @public
	 * @async
	 * @param {{email: string}} param0
	 * @param {string} param0.email
	 * @returns {Promise<void>}
	 */
	public async sendRequest({ email }: { email: string }): Promise<void> {
		await this.sdk.api(3).contacts().requestsSend({
			email
		})
	}

	/**
	 * Accept incoming contact request.
	 * @date 2/20/2024 - 6:36:26 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async acceptRequest({ uuid }: { uuid: string }): Promise<void> {
		await this.sdk.api(3).contacts().requestsAccept({
			uuid
		})
	}

	/**
	 * Deny incoming contact request.
	 * @date 2/20/2024 - 6:36:17 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async denyRequest({ uuid }: { uuid: string }): Promise<void> {
		await this.sdk.api(3).contacts().requestsDeny({
			uuid
		})
	}

	/**
	 * Remove a contact.
	 * @date 2/20/2024 - 6:34:24 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async remove({ uuid }: { uuid: string }): Promise<void> {
		await this.sdk.api(3).contacts().delete({
			uuid
		})
	}

	/**
	 * Fetch all blocked contacts.
	 * @date 2/20/2024 - 6:34:55 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<BlockedContact[]>}
	 */
	public async blocked(): Promise<BlockedContact[]> {
		return await this.sdk.api(3).contacts().blocked()
	}

	/**
	 * Block a user.
	 * @date 2/20/2024 - 6:36:11 AM
	 *
	 * @public
	 * @async
	 * @param {{email: string}} param0
	 * @param {string} param0.email
	 * @returns {Promise<void>}
	 */
	public async block({ email }: { email: string }): Promise<void> {
		await this.sdk.api(3).contacts().blockedAdd({
			email
		})
	}

	/**
	 * Unblock a contact.
	 * @date 2/20/2024 - 6:36:05 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async unblock({ uuid }: { uuid: string }): Promise<void> {
		await this.sdk.api(3).contacts().blockedDelete({
			uuid
		})
	}
}

export default Contacts
