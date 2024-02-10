import type APIClient from "../../../client";
/**
 * UserPersonalUpdate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserPersonalUpdate
 * @typedef {UserPersonalUpdate}
 */
export declare class UserPersonalUpdate {
    private readonly apiClient;
    /**
     * Creates an instance of UserPersonalUpdate.
     * @date 2/1/2024 - 8:16:39 PM
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
     * Update personal information.
     * @date 2/10/2024 - 1:43:57 AM
     *
     * @public
     * @async
     * @param {{
     *         city?: string
     *         companyName?: string
     *         country?: string
     *         firstName?: string
     *         lastName?: string
     *         postalCode?: string
     *         street?: string
     *         streetNumber?: string
     *         vatId?: string
     *     }} param0
     * @param {string} [param0.city="__NONE__"]
     * @param {string} [param0.companyName="__NONE__"]
     * @param {string} [param0.country="__NONE__"]
     * @param {string} [param0.firstName="__NONE__"]
     * @param {string} [param0.lastName="__NONE__"]
     * @param {string} [param0.postalCode="__NONE__"]
     * @param {string} [param0.street="__NONE__"]
     * @param {string} [param0.streetNumber="__NONE__"]
     * @param {string} [param0.vatId="__NONE__"]
     * @returns {Promise<void>}
     */
    fetch({ city, companyName, country, firstName, lastName, postalCode, street, streetNumber, vatId }: {
        city?: string;
        companyName?: string;
        country?: string;
        firstName?: string;
        lastName?: string;
        postalCode?: string;
        street?: string;
        streetNumber?: string;
        vatId?: string;
    }): Promise<void>;
}
export default UserPersonalUpdate;
