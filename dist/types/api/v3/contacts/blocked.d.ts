import type APIClient from "../../client";
export type BlockedContact = {
    uuid: string;
    userId: number;
    email: string;
    avatar: string | null;
    nickName: string;
    timestamp: number;
};
export type ContactsBlockedResponse = BlockedContact[];
/**
 * ContactsBlocked
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsBlocked
 * @typedef {ContactsBlocked}
 */
export declare class ContactsBlocked {
    private readonly apiClient;
    /**
     * Creates an instance of ContactsBlocked.
     * @date 2/1/2024 - 3:19:15 PM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }: {
        apiClient: APIClient;
    });
    /**
     * Fetch all blocked contacts.
     * @date 2/13/2024 - 5:56:16 AM
     *
     * @public
     * @async
     * @returns {Promise<ContactsBlockedResponse>}
     */
    fetch(): Promise<ContactsBlockedResponse>;
}
export default ContactsBlocked;
