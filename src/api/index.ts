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

	private readonly _v3: {
		health: V3Health
		dir: {
			content: V3DirContent
			download: V3DirDownload
			shared: V3DirShared
			linked: V3DirLinked
		}
		auth: {
			info: V3AuthInfo
		}
		login: V3Login
		user: {
			info: V3UserInfo
			baseFolder: V3UserBaseFolder
		}
		shared: {
			in: V3SharedIn
			out: V3SharedOut
		}
		upload: {
			done: V3UploadDone
		}
	}

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

		this.apiClient = new APIClient({ apiKey: this.config.apiKey })

		this._v3 = {
			health: new V3Health({ apiClient: this.apiClient }),
			dir: {
				content: new V3DirContent({ apiClient: this.apiClient }),
				download: new V3DirDownload({ apiClient: this.apiClient }),
				shared: new V3DirShared({ apiClient: this.apiClient }),
				linked: new V3DirLinked({ apiClient: this.apiClient })
			},
			auth: {
				info: new V3AuthInfo({ apiClient: this.apiClient })
			},
			login: new V3Login({ apiClient: this.apiClient }),
			user: {
				info: new V3UserInfo({ apiClient: this.apiClient }),
				baseFolder: new V3UserBaseFolder({ apiClient: this.apiClient })
			},
			shared: {
				in: new V3SharedIn({ apiClient: this.apiClient }),
				out: new V3SharedOut({ apiClient: this.apiClient })
			},
			upload: {
				done: new V3UploadDone({ apiClient: this.apiClient })
			}
		}
	}

	public v3() {
		return {
			health: () => this._v3.health.fetch(),
			dir: () => {
				return {
					content: (...params: Parameters<typeof this._v3.dir.content.fetch>) => this._v3.dir.content.fetch(...params),
					download: (...params: Parameters<typeof this._v3.dir.download.fetch>) => this._v3.dir.download.fetch(...params),
					shared: (...params: Parameters<typeof this._v3.dir.shared.fetch>) => this._v3.dir.shared.fetch(...params),
					linked: (...params: Parameters<typeof this._v3.dir.linked.fetch>) => this._v3.dir.linked.fetch(...params)
				}
			},
			auth: () => {
				return {
					info: (...params: Parameters<typeof this._v3.auth.info.fetch>) => this._v3.auth.info.fetch(...params)
				}
			},
			login: (...params: Parameters<typeof this._v3.login.fetch>) => this._v3.login.fetch(...params),
			user: () => {
				return {
					info: (...params: Parameters<typeof this._v3.user.info.fetch>) => this._v3.user.info.fetch(...params),
					baseFolder: (...params: Parameters<typeof this._v3.user.baseFolder.fetch>) => this._v3.user.baseFolder.fetch(...params)
				}
			},
			shared: () => {
				return {
					in: (...params: Parameters<typeof this._v3.shared.in.fetch>) => this._v3.shared.in.fetch(...params),
					out: (...params: Parameters<typeof this._v3.shared.out.fetch>) => this._v3.shared.out.fetch(...params)
				}
			},
			upload: () => {
				return {
					done: (...params: Parameters<typeof this._v3.upload.done.fetch>) => this._v3.upload.done.fetch(...params)
				}
			}
		}
	}
}

export default API
