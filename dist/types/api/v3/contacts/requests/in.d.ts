import type APIClient from "../../../client";
export type ContactRequest = {
    uuid: string;
    userId: number;
    email: string;
    avatar: string | null;
    nickName: string;
    timestamp: number;
};
export type ContactsRequestsInResponse = ContactRequest[];
/**
 * ContactsRequestsIn
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ContactsRequestsIn
 * @typedef {ContactsRequestsIn}
 */
export declare class ContactsRequestsIn {
    private readonly apiClient;
    /**
     * Creates an instance of ContactsRequestsIn.
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
     * Fetch all incoming contact requests.
     * @date 2/13/2024 - 5:56:16 AM
     *
     * @public
     * @async
     * @returns {Promise<ContactsRequestsInResponse>}
     */
    fetch(): Promise<ContactsRequestsInResponse>;
}
export default ContactsRequestsIn;
