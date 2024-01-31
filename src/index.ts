import API from "./api"
import type { AuthVersion } from "./types"

export type FilenSDKConfig = {
	email?: string
	password?: string
	twoFactorCode?: string
	masterKeys?: string[]
	apiKey?: string
	publicKey?: string
	privateKey?: string
	authVersion?: AuthVersion
	baseFolderUUID?: string
	userId?: number
}

export default class FilenSDK {
	private readonly config: FilenSDKConfig = {
		email: "",
		password: "",
		twoFactorCode: ""
	} as const
	private readonly _api: API

	public constructor(params: FilenSDKConfig) {
		this.config = params
		this._api = params.apiKey ? new API({ apiKey: params.apiKey }) : new API({ apiKey: "anonymous" })
	}

	private isLoggedIn() {
		return (
			this.config.apiKey &&
			this.config.masterKeys &&
			this.config.publicKey &&
			this.config.privateKey &&
			this.config.baseFolderUUID &&
			this.config.authVersion &&
			this.config.userId &&
			this.config.apiKey.length > 0 &&
			this.config.masterKeys.length > 0 &&
			this.config.publicKey.length > 0 &&
			this.config.privateKey.length > 0 &&
			this.config.baseFolderUUID.length > 0 &&
			this.config.userId > 0 &&
			[1, 2].includes(this.config.authVersion)
		)
	}

	public async login() {
		if (!this.config.email || !this.config.password || this.config.email.length === 0 || this.config.password.length === 0) {
			throw new Error("Empty email or password")
		}
	}

	public api() {
		if (!this.isLoggedIn()) {
			throw new Error("Not authenticated, please call login() first")
		}

		return this._api
	}
}
