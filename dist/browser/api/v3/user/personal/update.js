/**
 * UserPersonalUpdate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserPersonalUpdate
 * @typedef {UserPersonalUpdate}
 */
export class UserPersonalUpdate {
    apiClient;
    /**
     * Creates an instance of UserPersonalUpdate.
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
     * Update personal information.
     * @date 2/20/2024 - 6:52:39 AM
     *
     * @public
     * @async
     * @param {{
     * 		city: string
     * 		companyName: string
     * 		country: string
     * 		firstName: string
     * 		lastName: string
     * 		postalCode: string
     * 		street: string
     * 		streetNumber: string
     * 		vatId: string
     * 	}} param0
     * @param {string} param0.city
     * @param {string} param0.companyName
     * @param {string} param0.country
     * @param {string} param0.firstName
     * @param {string} param0.lastName
     * @param {string} param0.postalCode
     * @param {string} param0.street
     * @param {string} param0.streetNumber
     * @param {string} param0.vatId
     * @returns {Promise<void>}
     */
    async fetch({ city, companyName, country, firstName, lastName, postalCode, street, streetNumber, vatId }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/personal/update",
            data: {
                city,
                companyName,
                country,
                firstName,
                lastName,
                postalCode,
                street,
                streetNumber,
                vatId
            }
        });
    }
}
export default UserPersonalUpdate;
//# sourceMappingURL=update.js.map