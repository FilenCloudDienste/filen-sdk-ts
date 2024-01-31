import APIClient from "./client"
import V3Health from "./v3/health"
import V3DirContent from "./v3/dir/content"

export type APIConfig = {
	apiKey: string
}

export default class API {
	private readonly config: APIConfig = {
		apiKey: ""
	} as const
	private apiClient: APIClient = new APIClient({ apiKey: "anonymous" })

	public constructor(params: APIConfig) {
		this.config = params

		if (this.config.apiKey.length === 0) {
			throw new Error("Invalid apiKey")
		}

		this.apiClient = new APIClient({
			apiKey: this.config.apiKey
		})
	}

	public v3() {
		return {
			health: () =>
				new V3Health({
					apiClient: this.apiClient
				}),
			dir: () => {
				return {
					content: () =>
						new V3DirContent({
							apiClient: this.apiClient
						})
				}
			}
		}
	}
}
