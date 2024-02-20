import type APIClient from "../../client"
import type { ChatLastFocusValues } from "./lastFocusUpdate"

/**
 * ChatLastFocus
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatLastFocus
 * @typedef {ChatLastFocus}
 */
export class ChatLastFocus {
	private readonly apiClient: APIClient

	/**
	 * Creates an instance of ChatLastFocus.
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
	 * Fetch chat last focus values.
	 * @date 2/13/2024 - 6:40:39 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<ChatLastFocusValues[]>}
	 */
	public async fetch(): Promise<ChatLastFocusValues[]> {
		const response = await this.apiClient.request<ChatLastFocusValues[]>({
			method: "GET",
			endpoint: "/v3/chat/lastFocus"
		})

		return response
	}
}

export default ChatLastFocus
