import API from "./api"
import type { AuthVersion } from "./types"
import Crypto from "./crypto"
import utils from "./utils"

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

/**
 * FilenSDK
 * @date 2/1/2024 - 2:45:02 AM
 *
 * @export
 * @class FilenSDK
 * @typedef {FilenSDK}
 */
export class FilenSDK {
	private readonly config: FilenSDKConfig
	private readonly _api: API
	private readonly _crypto: Crypto

	/**
	 * Creates an instance of FilenSDK.
	 * @date 1/31/2024 - 4:04:52 PM
	 *
	 * @constructor
	 * @public
	 * @param {FilenSDKConfig} params
	 */
	public constructor(params: FilenSDKConfig) {
		this.config = params
		this._api = params.apiKey ? new API({ apiKey: params.apiKey }) : new API({ apiKey: "anonymous" })
		this._crypto =
			params.masterKeys && params.publicKey && params.privateKey
				? new Crypto({ masterKeys: params.masterKeys, publicKey: params.publicKey, privateKey: params.privateKey })
				: new Crypto({ masterKeys: [], publicKey: "", privateKey: "" })
	}

	/**
	 * Check if the SDK user is authenticated.
	 * @date 1/31/2024 - 4:08:17 PM
	 *
	 * @private
	 * @returns {boolean}
	 */
	private isLoggedIn(): boolean {
		return (
			typeof this.config.apiKey !== "undefined" &&
			typeof this.config.masterKeys !== "undefined" &&
			typeof this.config.publicKey !== "undefined" &&
			typeof this.config.privateKey !== "undefined" &&
			typeof this.config.baseFolderUUID !== "undefined" &&
			typeof this.config.authVersion !== "undefined" &&
			typeof this.config.userId !== "undefined" &&
			this.config.apiKey.length > 0 &&
			this.config.masterKeys.length > 0 &&
			this.config.publicKey.length > 0 &&
			this.config.privateKey.length > 0 &&
			this.config.baseFolderUUID.length > 0 &&
			this.config.userId > 0 &&
			[1, 2].includes(this.config.authVersion)
		)
	}

	/**
	 * Authenticate.
	 * @date 1/31/2024 - 4:08:44 PM
	 *
	 * @public
	 * @async
	 * @returns {Promise<void>}
	 */
	public async login(): Promise<void> {
		if (!this.config.email || !this.config.password || this.config.email.length === 0 || this.config.password.length === 0) {
			throw new Error("Empty email or password")
		}
	}

	/**
	 * Returns an instance of the API wrapper based on the given API version.
	 * @date 1/31/2024 - 4:28:59 PM
	 *
	 * @public
	 * @param {number} version
	 * @returns {*}
	 */
	public api(version: number) {
		if (!this.isLoggedIn()) {
			throw new Error("Not authenticated, please call login() first")
		}

		if (version === 3) {
			return this._api.v3()
		}

		throw new Error(`API version ${version} does not exist`)
	}

	/**
	 * Returns a Filen Crypto instance.
	 * @date 1/31/2024 - 4:29:49 PM
	 *
	 * @public
	 * @returns {Crypto}
	 */
	public crypto() {
		if (!this.isLoggedIn()) {
			throw new Error("Not authenticated, please call login() first")
		}

		return this._crypto
	}

	public readonly utils = utils
}

export default FilenSDK
