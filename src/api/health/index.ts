import type APIClient from "../client"

export default class Health {
	private readonly apiClient: APIClient

	public constructor({ apiClient }: { apiClient: APIClient }) {
		this.apiClient = apiClient
	}

	public async get(): Promise<string> {
		const response = await this.apiClient.request<"OK">({
			method: "GET",
			endpoint: "/v3/health"
		})

		return response
	}
}
