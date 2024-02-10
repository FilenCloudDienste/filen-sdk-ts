import type APIClient from "../../../client"

/**
 * UserPersonalUpdate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserPersonalUpdate
 * @typedef {UserPersonalUpdate}
 */
export class UserPersonalUpdate {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of UserPersonalUpdate.
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
	public async fetch({
		city = "__NONE__",
		companyName = "__NONE__",
		country = "__NONE__",
		firstName = "__NONE__",
		lastName = "__NONE__",
		postalCode = "__NONE__",
		street = "__NONE__",
		streetNumber = "__NONE__",
		vatId = "__NONE__"
	}: {
		city?: string
		companyName?: string
		country?: string
		firstName?: string
		lastName?: string
		postalCode?: string
		street?: string
		streetNumber?: string
		vatId?: string
	}): Promise<void> {
		if (city.length <= 0) {
			city = "__NONE__"
		}

		if (companyName.length <= 0) {
			companyName = "__NONE__"
		}

		if (country.length <= 0) {
			country = "__NONE__"
		}

		if (firstName.length <= 0) {
			firstName = "__NONE__"
		}

		if (lastName.length <= 0) {
			lastName = "__NONE__"
		}

		if (postalCode.length <= 0) {
			postalCode = "__NONE__"
		}

		if (street.length <= 0) {
			street = "__NONE__"
		}

		if (streetNumber.length <= 0) {
			streetNumber = "__NONE__"
		}

		if (vatId.length <= 0) {
			vatId = "__NONE__"
		}

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
		})
	}
}

export default UserPersonalUpdate
