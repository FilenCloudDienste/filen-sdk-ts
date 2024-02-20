"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsBlockedAdd = void 0;
/**
 * ContactsBlockedAdd
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ContactsBlockedAdd
 * @typedef {ContactsBlockedAdd}
 */
class ContactsBlockedAdd {
    /**
     * Creates an instance of ContactsBlockedAdd.
     * @date 2/1/2024 - 8:16:39 PM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }) {
        this.apiClient = apiClient;
    }
    /**
     * Block a contact or a user.
     * @date 2/13/2024 - 6:14:38 AM
     *
     * @public
     * @async
     * @param {{ email: string }} param0
     * @param {string} param0.email
     * @returns {Promise<void>}
     */
    async fetch({ email }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/contacts/blocked/add",
            data: {
                email
            }
        });
    }
}
exports.ContactsBlockedAdd = ContactsBlockedAdd;
exports.default = ContactsBlockedAdd;
//# sourceMappingURL=add.js.map