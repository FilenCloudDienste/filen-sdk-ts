import type APIClient from "../../client"

export type DirColors = "default" | "blue" | "green" | "purple" | "red" | "gray"

/**
 * DirColor
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirColor
 * @typedef {DirColor}
 */
export class DirColor {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of DirColor.
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
	 * Change the display color of a directory.
	 * @date 2/10/2024 - 1:21:30 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; color: DirColors }} param0
	 * @param {string} param0.uuid
	 * @param {DirColors} param0.color
	 * @returns {Promise<void>}
	 */
	public async fetch({ uuid, color }: { uuid: string; color: DirColors }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/dir/color",
			data: {
				uuid,
				color
			}
		})
	}
}

export default DirColor
