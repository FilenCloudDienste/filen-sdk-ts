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
import Cloud from "./cloud"
import pathModule from "path"
import Chats from "./chats"
import Notes from "./notes"
import Contacts from "./contacts"
import User from "./user"

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
	public config: FilenSDKConfig
	private _api: API
	private _crypto: Crypto
	private _fs: FS
	private _cloud: Cloud
	private _notes: Notes
	private _chats: Chats
	private _contacts: Contacts
	private _user: User

	/**
	 * Creates an instance of FilenSDK.
	 * @date 2/21/2024 - 8:58:43 AM
	 *
	 * @constructor
	 * @public
	 * @param {?FilenSDKConfig} [params]
	 */
	public constructor(params?: FilenSDKConfig) {
		if (!params) {
			params = {}
		}

		this.config = params
		this._crypto =
			params.masterKeys && params.publicKey && params.privateKey
				? new Crypto({
						masterKeys: params.masterKeys,
						publicKey: params.publicKey,
						privateKey: params.privateKey,
						metadataCache: params.metadataCache ? params.metadataCache : false,
						tmpPath:
							environment === "browser"
								? "/dev/null"
								: params.tmpPath
								? utils.normalizePath(params.tmpPath)
								: utils.normalizePath(os.tmpdir())
				  })
				: new Crypto({
						masterKeys: [],
						publicKey: "",
						privateKey: "",
						metadataCache: params.metadataCache ? params.metadataCache : false,
						tmpPath:
							environment === "browser"
								? "/dev/null"
								: params.tmpPath
								? utils.normalizePath(params.tmpPath)
								: utils.normalizePath(os.tmpdir())
				  })
		this._api = params.apiKey
			? new API({ apiKey: params.apiKey, crypto: this._crypto })
			: new API({ apiKey: "anonymous", crypto: this._crypto })
		this._cloud = new Cloud({ sdkConfig: params, api: this._api, crypto: this._crypto })
		this._fs = new FS({ sdkConfig: params, api: this._api, cloud: this._cloud })
		this._notes = new Notes({ sdkConfig: params, api: this._api, crypto: this._crypto })
		this._chats = new Chats({ sdkConfig: params, api: this._api, crypto: this._crypto })
		this._contacts = new Contacts({ sdkConfig: params, api: this._api })
		this._user = new User({ sdkConfig: params, api: this._api, crypto: this._crypto })
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
							environment === "browser"
								? "/dev/null"
								: params.tmpPath
								? utils.normalizePath(params.tmpPath)
								: utils.normalizePath(os.tmpdir())
				  })
				: new Crypto({
						masterKeys: [],
						publicKey: "",
						privateKey: "",
						metadataCache: params.metadataCache ? params.metadataCache : false,
						tmpPath:
							environment === "browser"
								? "/dev/null"
								: params.tmpPath
								? utils.normalizePath(params.tmpPath)
								: utils.normalizePath(os.tmpdir())
				  })
		this._api = params.apiKey
			? new API({ apiKey: params.apiKey, crypto: this._crypto })
			: new API({ apiKey: "anonymous", crypto: this._crypto })
		this._cloud = new Cloud({ sdkConfig: params, api: this._api, crypto: this._crypto })
		this._fs = new FS({ sdkConfig: params, api: this._api, cloud: this._cloud })
		this._notes = new Notes({ sdkConfig: params, api: this._api, crypto: this._crypto })
		this._chats = new Chats({ sdkConfig: params, api: this._api, crypto: this._crypto })
		this._contacts = new Contacts({ sdkConfig: params, api: this._api })
		this._user = new User({ sdkConfig: params, api: this._api, crypto: this._crypto })
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
	 * Update keypair.
	 * @date 2/20/2024 - 7:47:41 AM
	 *
	 * @private
	 * @async
	 * @param {{apiKey: string, publicKey: string, privateKey: string, masterKeys: string[]}} param0
	 * @param {string} param0.apiKey
	 * @param {string} param0.publicKey
	 * @param {string} param0.privateKey
	 * @param {{}} param0.masterKeys
	 * @returns {Promise<void>}
	 */
	private async _updateKeyPair({
		apiKey,
		publicKey,
		privateKey,
		masterKeys
	}: {
		apiKey: string
		publicKey: string
		privateKey: string
		masterKeys: string[]
	}): Promise<void> {
		const encryptedPrivateKey = await this._crypto.encrypt().metadata({ metadata: privateKey, key: masterKeys[masterKeys.length - 1] })

		await this._api.v3().user().keyPair().update({ publicKey, encryptedPrivateKey, apiKey })
	}

	/**
	 * Set keypair.
	 * @date 2/20/2024 - 7:48:10 AM
	 *
	 * @private
	 * @async
	 * @param {{apiKey: string, publicKey: string, privateKey: string, masterKeys: string[]}} param0
	 * @param {string} param0.apiKey
	 * @param {string} param0.publicKey
	 * @param {string} param0.privateKey
	 * @param {{}} param0.masterKeys
	 * @returns {Promise<void>}
	 */
	private async _setKeyPair({
		apiKey,
		publicKey,
		privateKey,
		masterKeys
	}: {
		apiKey: string
		publicKey: string
		privateKey: string
		masterKeys: string[]
	}): Promise<void> {
		const encryptedPrivateKey = await this._crypto.encrypt().metadata({ metadata: privateKey, key: masterKeys[masterKeys.length - 1] })

		await this._api.v3().user().keyPair().set({ publicKey, encryptedPrivateKey, apiKey })
	}

	private async __updateKeyPair({
		apiKey,
		masterKeys
	}: {
		apiKey: string
		masterKeys: string[]
	}): Promise<{ publicKey: string; privateKey: string }> {
		const keyPairInfo = await this._api.v3().user().keyPair().info({ apiKey })

		if (
			typeof keyPairInfo.publicKey === "string" &&
			typeof keyPairInfo.privateKey === "string" &&
			keyPairInfo.publicKey.length > 0 &&
			keyPairInfo.privateKey.length > 16
		) {
			let privateKey: string | null = null

			for (const masterKey of masterKeys) {
				try {
					const decryptedPrivateKey = await this._crypto.decrypt().metadata({ metadata: keyPairInfo.privateKey, key: masterKey })

					if (typeof decryptedPrivateKey === "string" && decryptedPrivateKey.length > 16) {
						privateKey = decryptedPrivateKey
					}
				} catch {
					continue
				}
			}

			if (!privateKey) {
				throw new Error("Could not decrypt private key.")
			}

			await this._updateKeyPair({ apiKey, publicKey: keyPairInfo.publicKey, privateKey, masterKeys })

			return {
				publicKey: keyPairInfo.publicKey,
				privateKey
			}
		}

		const generatedKeyPair = await this._crypto.utils.generateKeyPair()

		await this._setKeyPair({ apiKey, publicKey: generatedKeyPair.publicKey, privateKey: generatedKeyPair.privateKey, masterKeys })

		return {
			publicKey: generatedKeyPair.publicKey,
			privateKey: generatedKeyPair.privateKey
		}
	}

	private async _updateKeys({
		apiKey,
		masterKeys
	}: {
		apiKey: string
		masterKeys: string[]
	}): Promise<{ masterKeys: string[]; publicKey: string; privateKey: string }> {
		const encryptedMasterKeys = await this._crypto
			.encrypt()
			.metadata({ metadata: masterKeys.join("|"), key: masterKeys[masterKeys.length - 1] })
		const masterKeysResponse = await this._api.v3().user().masterKeys({ encryptedMasterKeys, apiKey })
		let newMasterKeys: string[] = [...masterKeys]

		for (const masterKey of masterKeys) {
			try {
				const decryptedMasterKeys = await this._crypto.decrypt().metadata({ metadata: masterKeysResponse.keys, key: masterKey })

				if (typeof decryptedMasterKeys === "string" && decryptedMasterKeys.length > 16 && decryptedMasterKeys.includes("|")) {
					newMasterKeys = [...masterKeys, ...decryptedMasterKeys.split("|")]
				}
			} catch {
				continue
			}
		}

		if (newMasterKeys.length === 0) {
			throw new Error("Could not decrypt master keys.")
		}

		const { publicKey, privateKey } = await this.__updateKeyPair({ apiKey, masterKeys: newMasterKeys })

		return {
			masterKeys: newMasterKeys,
			publicKey,
			privateKey
		}
	}

	/**
	 * Authenticate.
	 * @date 2/20/2024 - 7:24:10 AM
	 *
	 * @public
	 * @async
	 * @param {{email?: string, password?: string, twoFactorCode?: string}} param0
	 * @param {string} param0.email
	 * @param {string} param0.password
	 * @param {string} param0.twoFactorCode
	 * @returns {Promise<void>}
	 */
	public async login({ email, password, twoFactorCode }: { email?: string; password?: string; twoFactorCode?: string }): Promise<void> {
		const emailToUse = email ? email : this.config.email ? this.config.email : ""
		const passwordToUse = password ? password : this.config.password ? this.config.password : ""
		const twoFactorCodeToUse = twoFactorCode ? twoFactorCode : this.config.twoFactorCode ? this.config.twoFactorCode : "XXXXXX"
		let authVersion: AuthVersion | null = this.config.authVersion ? this.config.authVersion : null

		if (emailToUse.length === 0 || passwordToUse.length === 0 || twoFactorCodeToUse.length === 0) {
			throw new Error("Empty email, password or twoFactorCode")
		}

		const authInfo = await this._api.v3().auth().info({ email: emailToUse })

		if (!authVersion) {
			authVersion = authInfo.authVersion
		}

		const derived = await this._crypto.utils.generatePasswordAndMasterKeyBasedOnAuthVersion({
			rawPassword: passwordToUse,
			authVersion: authInfo.authVersion,
			salt: authInfo.salt
		})
		const loginResponse = await this._api.v3().login({ email: emailToUse, password: derived.derivedPassword, authVersion })
		const [infoResponse, baseFolderResponse] = await Promise.all([
			this._api.v3().user().info({ apiKey: loginResponse.apiKey }),
			this._api.v3().user().baseFolder({ apiKey: loginResponse.apiKey })
		])
		const updateKeys = await this._updateKeys({ apiKey: loginResponse.apiKey, masterKeys: [derived.derivedMasterKeys] })

		this.init({
			...this.config,
			email: emailToUse,
			password: passwordToUse,
			twoFactorCode: twoFactorCodeToUse,
			masterKeys: updateKeys.masterKeys,
			apiKey: loginResponse.apiKey,
			publicKey: updateKeys.publicKey,
			privateKey: updateKeys.privateKey,
			authVersion,
			baseFolderUUID: baseFolderResponse.uuid,
			userId: infoResponse.id
		})
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
	 * Returns an instance of Crypto.
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

	/**
	 * Returns an instance of FS.
	 * @date 2/17/2024 - 1:52:12 AM
	 *
	 * @public
	 * @returns {FS}
	 */
	public fs(): FS {
		if (!this.isLoggedIn()) {
			throw new Error("Not authenticated, please call login() first")
		}

		return this._fs
	}

	/**
	 * Returns an instance of Cloud.
	 * @date 2/17/2024 - 1:52:05 AM
	 *
	 * @public
	 * @returns {Cloud}
	 */
	public cloud(): Cloud {
		if (!this.isLoggedIn()) {
			throw new Error("Not authenticated, please call login() first")
		}

		return this._cloud
	}

	/**
	 * Returns an instance of Notes.
	 * @date 2/19/2024 - 6:32:35 AM
	 *
	 * @public
	 * @returns {Notes}
	 */
	public notes(): Notes {
		if (!this.isLoggedIn()) {
			throw new Error("Not authenticated, please call login() first")
		}

		return this._notes
	}

	/**
	 * Returns an instance of Chats.
	 * @date 2/19/2024 - 6:32:35 AM
	 *
	 * @public
	 * @returns {Chats}
	 */
	public chats(): Chats {
		if (!this.isLoggedIn()) {
			throw new Error("Not authenticated, please call login() first")
		}

		return this._chats
	}

	/**
	 * Returns an instance of Contacts.
	 * @date 2/20/2024 - 6:27:05 AM
	 *
	 * @public
	 * @returns {Contacts}
	 */
	public contacts(): Contacts {
		if (!this.isLoggedIn()) {
			throw new Error("Not authenticated, please call login() first")
		}

		return this._contacts
	}

	/**
	 * Return an instance of User.
	 * @date 2/20/2024 - 6:27:17 AM
	 *
	 * @public
	 * @returns {User}
	 */
	public user(): User {
		if (!this.isLoggedIn()) {
			throw new Error("Not authenticated, please call login() first")
		}

		return this._user
	}

	/**
	 * Clear the temporary directory. Only available in a Node.JS environment.
	 * @date 2/17/2024 - 1:51:39 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<void>}
	 */
	public async clearTemporaryDirectory(): Promise<void> {
		if (environment !== "node") {
			return
		}

		const tmpDir = utils.normalizePath(pathModule.join(this.config.tmpPath ? this.config.tmpPath : os.tmpdir(), "filen-sdk"))

		await utils.clearTempDirectory({ tmpDir })
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

export { CloudItem, CloudItemShared, CloudItemFile, CloudItemDirectory, CloudItemTree, CloudConfig } from "./cloud"
export { FSItem, FSItemType, FSStats, StatFS, FSConfig } from "./fs"
export * from "./types"
export { CryptoConfig } from "./crypto"
export * from "./constants"

module.exports = FilenSDK
exports.default = FilenSDK
