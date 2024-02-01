import APIClient from "./client"
import V3Health from "./v3/health"
import V3DirContent from "./v3/dir/content"
import V3AuthInfo from "./v3/auth/info"
import V3Login from "./v3/login"
import V3UserInfo from "./v3/user/info"
import V3UserBaseFolder from "./v3/user/baseFolder"
import V3SharedIn from "./v3/shared/in"
import V3SharedOut from "./v3/shared/out"
import V3UploadDone from "./v3/upload/done"
import V3DirDownload from "./v3/dir/download"
import V3DirShared from "./v3/dir/shared"
import V3DirLinked from "./v3/dir/linked"

export type APIConfig = {
	apiKey: string
}

/**
 * API
 * @date 2/1/2024 - 4:46:43 PM
 *
 * @export
 * @class API
 * @typedef {API}
 */
export class API {
	private readonly config: APIConfig = {
		apiKey: ""
	} as const

	private readonly apiClient: APIClient

	/**
	 * Creates an instance of API.
	 * @date 2/1/2024 - 4:46:38 PM
	 *
	 * @constructor
	 * @public
	 * @param {APIConfig} params
	 */
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
						}),
					download: () =>
						new V3DirDownload({
							apiClient: this.apiClient
						}),
					shared: () =>
						new V3DirShared({
							apiClient: this.apiClient
						}),
					linked: () =>
						new V3DirLinked({
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
			},
			shared: () => {
				return {
					in: () =>
						new V3SharedIn({
							apiClient: this.apiClient
						}),
					out: () =>
						new V3SharedOut({
							apiClient: this.apiClient
						})
				}
			},
			upload: () => {
				return {
					done: () =>
						new V3UploadDone({
							apiClient: this.apiClient
						})
				}
			}
		}
	}
}

export default API
