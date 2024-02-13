import "./reactNative"
import API from "./api"
import type { AuthVersion } from "./types"
import Crypto from "./crypto"
import utils from "./utils"
import { environment } from "./constants"
import os from "os"
import FS from "./fs"
import appendStream from "./streams/append"
import { streamDecodeBase64, streamEncodeBase64 } from "./streams/base64"
import cryptoUtils from "./crypto/utils"

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
	metadataCache?: boolean
	tmpPath?: string
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
	private config: FilenSDKConfig
	private _api: API
	private _crypto: Crypto
	private _fs: FS

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
		this._crypto =
			params.masterKeys && params.publicKey && params.privateKey
				? new Crypto({
						masterKeys: params.masterKeys,
						publicKey: params.publicKey,
						privateKey: params.privateKey,
						metadataCache: params.metadataCache ? params.metadataCache : false,
						tmpPath:
							environment === "browser" ? "/dev/null" : params.tmpPath ? utils.normalizePath(params.tmpPath) : os.tmpdir()
				  })
				: new Crypto({
						masterKeys: [],
						publicKey: "",
						privateKey: "",
						metadataCache: params.metadataCache ? params.metadataCache : false,
						tmpPath:
							environment === "browser" ? "/dev/null" : params.tmpPath ? utils.normalizePath(params.tmpPath) : os.tmpdir()
				  })
		this._api = params.apiKey
			? new API({ apiKey: params.apiKey, crypto: this._crypto })
			: new API({ apiKey: "anonymous", crypto: this._crypto })
		this._fs = new FS({ sdkConfig: params, api: this._api, crypto: this._crypto })
	}

	/**
	 * Initialize the SDK again (after logging in for example).
	 * @date 2/1/2024 - 3:23:58 PM
	 *
	 * @public
	 * @param {FilenSDKConfig} params
	 */
	public init(params: FilenSDKConfig): void {
		this.config = params
		this._crypto =
			params.masterKeys && params.publicKey && params.privateKey
				? new Crypto({
						masterKeys: params.masterKeys,
						publicKey: params.publicKey,
						privateKey: params.privateKey,
						metadataCache: params.metadataCache ? params.metadataCache : false,
						tmpPath:
							environment === "browser" ? "/dev/null" : params.tmpPath ? utils.normalizePath(params.tmpPath) : os.tmpdir()
				  })
				: new Crypto({
						masterKeys: [],
						publicKey: "",
						privateKey: "",
						metadataCache: params.metadataCache ? params.metadataCache : false,
						tmpPath:
							environment === "browser" ? "/dev/null" : params.tmpPath ? utils.normalizePath(params.tmpPath) : os.tmpdir()
				  })
		this._api = params.apiKey
			? new API({ apiKey: params.apiKey, crypto: this._crypto })
			: new API({ apiKey: "anonymous", crypto: this._crypto })
		this._fs = new FS({ sdkConfig: params, api: this._api, crypto: this._crypto })
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
	 * Logout.
	 * @date 2/9/2024 - 5:48:28 AM
	 *
	 * @public
	 */
	public logout(): void {
		this.init({
			...this.config,
			email: undefined,
			password: undefined,
			twoFactorCode: undefined,
			masterKeys: undefined,
			apiKey: undefined,
			publicKey: undefined,
			privateKey: undefined,
			authVersion: undefined,
			baseFolderUUID: undefined,
			userId: undefined
		})
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
	public crypto(): Crypto {
		if (!this.isLoggedIn()) {
			throw new Error("Not authenticated, please call login() first")
		}

		return this._crypto
	}

	public fs(): FS {
		if (!this.isLoggedIn()) {
			throw new Error("Not authenticated, please call login() first")
		}

		return this._fs
	}

	public readonly utils = {
		...utils,
		crypto: cryptoUtils,
		streams: {
			append: appendStream,
			decodeBase64: streamDecodeBase64,
			encodeBase64: streamEncodeBase64
		}
	}
}

export default FilenSDK

module.exports = FilenSDK
