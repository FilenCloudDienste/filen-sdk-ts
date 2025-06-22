import type APIClient from "../../client"

export class ChatMute {
	private readonly apiClient: APIClient

	public constructor({ apiClient }: { apiClient: APIClient }) {
		this.apiClient = apiClient
	}

	public async fetch({ uuid, mute }: { uuid: string; mute: boolean }): Promise<void> {
		await this.apiClient.request({
			method: "POST",
			endpoint: "/v3/chat/mute",
			data: {
				uuid,
				mute
			}
		})
	}
}

export default ChatMute
