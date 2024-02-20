import type API from "../api";
import type { FilenSDKConfig } from "..";
import type { Contact } from "../api/v3/contacts";
import type { BlockedContact } from "../api/v3/contacts/blocked";
import type { ContactRequest } from "../api/v3/contacts/requests/in";
export type ContactsConfig = {
    sdkConfig: FilenSDKConfig;
    api: API;
};
/**
 * Contacts
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class Contacts
 * @typedef {Contacts}
 */
export declare class Contacts {
    private readonly api;
    private readonly sdkConfig;
    /**
     * Creates an instance of Contacts.
     * @date 2/9/2024 - 5:54:11 AM
     *
     * @constructor
     * @public
     * @param {ContactsConfig} params
     */
    constructor(params: ContactsConfig);
    /**
     * Fetch all contacts.
     * @date 2/20/2024 - 6:28:41 AM
     *
     * @public
     * @async
     * @returns {Promise<Contact[]>}
     */
    all(): Promise<Contact[]>;
    /**
     * Fetch all incoming contact requests.
     * @date 2/20/2024 - 6:29:43 AM
     *
     * @public
     * @async
     * @returns {Promise<ContactRequest[]>}
     */
    incomingRequests(): Promise<ContactRequest[]>;
    /**
     * Fetch count of all incoming contact requests.
     * @date 2/20/2024 - 6:30:11 AM
     *
     * @public
     * @async
     * @returns {Promise<number>}
     */
    incomingRequestsCount(): Promise<number>;
    /**
     * Fetch all outgoing contact requests.
     * @date 2/20/2024 - 6:29:43 AM
     *
     * @public
     * @async
     * @returns {Promise<ContactRequest[]>}
     */
    outgoingRequests(): Promise<ContactRequest[]>;
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
    deleteOutgoingRequest({ uuid }: {
        uuid: string;
    }): Promise<void>;
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
    sendRequest({ email }: {
        email: string;
    }): Promise<void>;
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
    acceptRequest({ uuid }: {
        uuid: string;
    }): Promise<void>;
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
    denyRequest({ uuid }: {
        uuid: string;
    }): Promise<void>;
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
    remove({ uuid }: {
        uuid: string;
    }): Promise<void>;
    /**
     * Fetch all blocked contacts.
     * @date 2/20/2024 - 6:34:55 AM
     *
     * @public
     * @async
     * @returns {Promise<BlockedContact[]>}
     */
    blocked(): Promise<BlockedContact[]>;
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
    block({ email }: {
        email: string;
    }): Promise<void>;
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
    unblock({ uuid }: {
        uuid: string;
    }): Promise<void>;
}
export default Contacts;
