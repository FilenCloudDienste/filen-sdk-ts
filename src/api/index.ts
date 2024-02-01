import APIClient from "./client"
import V3Health from "./v3/health"
import V3DirContent from "./v3/dir/content"
import V3AuthInfo from "./v3/auth/info"
import V3Login from "./v3/login"
import V3UserInfo from "./v3/user/info"
import V3UserBaseFolder from "./v3/user/baseFolder"

export type APIConfig = {
	apiKey: string
}

export class API {
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
			},
			auth: () => {
				return {
					info: () =>
						new V3AuthInfo({
							apiClient: this.apiClient
						})
				}
			},
			login: () =>
				new V3Login({
					apiClient: this.apiClient
				}),
			user: () => {
				return {
					info: () =>
						new V3UserInfo({
							apiClient: this.apiClient
						}),
					baseFolder: () =>
						new V3UserBaseFolder({
							apiClient: this.apiClient
						})
				}
			}
		}
	}
}

export default API
