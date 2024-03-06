/**
 * Contacts
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class Contacts
 * @typedef {Contacts}
 */
export class Contacts {
    api;
    sdkConfig;
    /**
     * Creates an instance of Contacts.
     * @date 2/9/2024 - 5:54:11 AM
     *
     * @constructor
     * @public
     * @param {ContactsConfig} params
     */
    constructor(params) {
        this.api = params.api;
        this.sdkConfig = params.sdkConfig;
    }
    /**
     * Fetch all contacts.
     * @date 2/20/2024 - 6:28:41 AM
     *
     * @public
     * @async
     * @returns {Promise<Contact[]>}
     */
    async all() {
        return await this.api.v3().contacts().all();
    }
    /**
     * Fetch all incoming contact requests.
     * @date 2/20/2024 - 6:29:43 AM
     *
     * @public
     * @async
     * @returns {Promise<ContactRequest[]>}
     */
    async incomingRequests() {
        return await this.api.v3().contacts().requestsIn();
    }
    /**
     * Fetch count of all incoming contact requests.
     * @date 2/20/2024 - 6:30:11 AM
     *
     * @public
     * @async
     * @returns {Promise<number>}
     */
    async incomingRequestsCount() {
        return await this.api.v3().contacts().requestsInCount();
    }
    /**
     * Fetch all outgoing contact requests.
     * @date 2/20/2024 - 6:29:43 AM
     *
     * @public
     * @async
     * @returns {Promise<ContactRequest[]>}
     */
    async outgoingRequests() {
        return await this.api.v3().contacts().requestsOut();
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
    async deleteOutgoingRequest({ uuid }) {
        await this.api.v3().contacts().requestsOutDelete({ uuid });
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
    async sendRequest({ email }) {
        await this.api.v3().contacts().requestsSend({ email });
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
    async acceptRequest({ uuid }) {
        await this.api.v3().contacts().requestsAccept({ uuid });
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
    async denyRequest({ uuid }) {
        await this.api.v3().contacts().requestsDeny({ uuid });
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
    async remove({ uuid }) {
        await this.api.v3().contacts().delete({ uuid });
    }
    /**
     * Fetch all blocked contacts.
     * @date 2/20/2024 - 6:34:55 AM
     *
     * @public
     * @async
     * @returns {Promise<BlockedContact[]>}
     */
    async blocked() {
        return await this.api.v3().contacts().blocked();
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
    async block({ email }) {
        await this.api.v3().contacts().blockedAdd({ email });
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
    async unblock({ uuid }) {
        await this.api.v3().contacts().blockedDelete({ uuid });
    }
}
export default Contacts;
//# sourceMappingURL=index.js.map