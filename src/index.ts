import API from "./api"
import { type AuthVersion, type ClassMethods } from "./types"
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
import Socket from "./socket"
import type Encrypt from "./crypto/encrypt"
import type Decrypt from "./crypto/decrypt"
import type APIV3FileUploadChunkBuffer from "./api/v3/file/upload/chunk/buffer"
import type APIV3FileDownloadChunkBuffer from "./api/v3/file/download/chunk/buffer"
import TypedEventEmitter, { type Events } from "./events"
import axios, { type AxiosInstance } from "axios"

export type SDKWorker = {
	crypto: {
		encrypt: ClassMethods<Encrypt>
		decrypt: ClassMethods<Decrypt>
		utils: typeof cryptoUtils
	}
	api: {
		v3: {
			file: {
				upload: {
					chunk: {
						buffer: ClassMethods<APIV3FileUploadChunkBuffer>
					}
				}
				download: {
					chunk: {
						buffer: ClassMethods<APIV3FileDownloadChunkBuffer>
					}
				}
			}
		}
	}
}

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
	connectToSocket?: boolean
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
	public socket: Socket = new Socket()
	private _updateKeyPairTries = 0
	public workers: SDKWorker[] | null
	private currentWorkerWorkIndex: number = 0
	public readonly events: TypedEventEmitter<Events>
	public readonly axiosInstance: AxiosInstance

	/**
	 * Creates an instance of FilenSDK.
	 *
	 * @constructor
	 * @public
	 * @param {?FilenSDKConfig} [params]
	 * @param {?SDKWorker[]} [workers]
	 * @param {?AxiosInstance} [axiosInstance]
	 */
	public constructor(params?: FilenSDKConfig, workers?: SDKWorker[], axiosInstance?: AxiosInstance) {
		if (!params) {
			params = {}
		}

		this.config = params
		this.workers = workers ? workers : null
		this.events = new TypedEventEmitter<Events>()
		this.axiosInstance = axiosInstance ? axiosInstance : axios.create()

		this._crypto = new Crypto(this)
		this._api = new API(this)
		this._cloud = new Cloud(this)
		this._fs = new FS({
			sdk: this,
			connectToSocket: params.connectToSocket
		})
		this._notes = new Notes(this)
		this._chats = new Chats(this)
		this._contacts = new Contacts(this)
		this._user = new User(this)
	}

	/**
	 * Initialize the SDK again (after logging in for example).
	 * @date 2/1/2024 - 3:23:58 PM
	 *
	 * @public
	 * @param {FilenSDKConfig} params
	 */
	public init(params?: FilenSDKConfig): void {
		if (!params) {
			params = {}
		}

		this.config = params

		this._crypto = new Crypto(this)
		this._api = new API(this)
		this._cloud = new Cloud(this)
		this._fs = new FS({
			sdk: this,
			connectToSocket: params.connectToSocket
		})
		this._notes = new Notes(this)
		this._chats = new Chats(this)
		this._contacts = new Contacts(this)
		this._user = new User(this)
	}

	/**
	 * Update the SDK Worker pool.
	 *
	 * @public
	 * @param {SDKWorker[]} sdkWorkers
	 */
	public setSDKWorkers(sdkWorkers: SDKWorker[]): void {
		this.workers = sdkWorkers
	}

	public getBaseWorker(): SDKWorker {
		const baseWorker: SDKWorker = {
			crypto: {
				encrypt: this.crypto().encrypt(),
				decrypt: this.crypto().decrypt(),
				utils: cryptoUtils
			},
			api: {
				v3: {
					file: {
						upload: {
							chunk: {
								buffer: {
									fetch: params => {
										return this._api.v3().file().upload().chunk().buffer(params)
									}
								}
							}
						},
						download: {
							chunk: {
								buffer: {
									fetch: params => {
										return this._api.v3().file().download().chunk().buffer(params)
									}
								}
							}
						}
					}
				}
			}
		}

		return baseWorker
	}

	/**
	 * Get a worker from the SDK Worker pool if set. Greatly improves performance.
	 *
	 * @public
	 * @returns {SDKWorker}
	 */
	public getWorker(): SDKWorker {
		const baseWorker: SDKWorker = {
			crypto: {
				encrypt: this.crypto().encrypt(),
				decrypt: this.crypto().decrypt(),
				utils: cryptoUtils
			},
			api: {
				v3: {
					file: {
						upload: {
							chunk: {
								buffer: {
									fetch: params => {
										return this._api.v3().file().upload().chunk().buffer(params)
									}
								}
							}
						},
						download: {
							chunk: {
								buffer: {
									fetch: params => {
										return this._api.v3().file().download().chunk().buffer(params)
									}
								}
							}
						}
					}
				}
			}
		}

		if (!this.workers || this.workers.length === 0) {
			return baseWorker
		}

		if (
			this.currentWorkerWorkIndex === undefined ||
			this.currentWorkerWorkIndex < 0 ||
			this.currentWorkerWorkIndex >= this.workers.length
		) {
			this.currentWorkerWorkIndex = 0
		}

		const workerToUse = this.workers[this.currentWorkerWorkIndex]

		this.currentWorkerWorkIndex = (this.currentWorkerWorkIndex + 1) % this.workers.length

		return workerToUse || baseWorker
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
			[1, 2, 3].includes(this.config.authVersion)
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
		const encryptedPrivateKey = await this.getWorker().crypto.encrypt.metadata({
			metadata: privateKey,
			key: masterKeys.at(-1)
		})

		await this._api.v3().user().keyPair().update({
			publicKey,
			encryptedPrivateKey,
			apiKey
		})
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
		const encryptedPrivateKey = await this.getWorker().crypto.encrypt.metadata({
			metadata: privateKey,
			key: masterKeys.at(-1)
		})

		await this._api.v3().user().keyPair().set({
			publicKey,
			encryptedPrivateKey,
			apiKey
		})
	}

	private async __updateKeyPair({
		apiKey,
		masterKeys
	}: {
		apiKey: string
		masterKeys: string[]
	}): Promise<{ publicKey: string; privateKey: string }> {
		const keyPairInfo = await this._api.v3().user().keyPair().info({
			apiKey
		})

		if (
			typeof keyPairInfo.publicKey === "string" &&
			typeof keyPairInfo.privateKey === "string" &&
			keyPairInfo.publicKey.length > 0 &&
			keyPairInfo.privateKey.length > 0
		) {
			let privateKey: string | null = null

			for (const masterKey of masterKeys) {
				try {
					const decryptedPrivateKey = await this.getWorker().crypto.decrypt.metadata({
						metadata: keyPairInfo.privateKey,
						key: masterKey
					})

					if (typeof decryptedPrivateKey === "string" && decryptedPrivateKey.length > 16) {
						privateKey = decryptedPrivateKey

						break
					}
				} catch {
					continue
				}
			}

			if (!privateKey) {
				// If the user for example changed his password and did not properly import the old master keys, it could be that we cannot decrypt the private key anymore.
				// We try to decrypt it 3 times (might be network/API related) and if it still does not work, we generate a new keypair.
				if (this._updateKeyPairTries < 3) {
					this._updateKeyPairTries += 1

					await new Promise<void>(resolve => setTimeout(resolve, 250))

					return await this.__updateKeyPair({
						apiKey,
						masterKeys
					})
				}

				const generatedKeyPair = await this.getWorker().crypto.utils.generateKeyPair()

				await this._updateKeyPair({
					apiKey,
					publicKey: generatedKeyPair.publicKey,
					privateKey: generatedKeyPair.privateKey,
					masterKeys
				})

				return {
					publicKey: generatedKeyPair.publicKey,
					privateKey: generatedKeyPair.privateKey
				}
			}

			await this._updateKeyPair({
				apiKey,
				publicKey: keyPairInfo.publicKey,
				privateKey,
				masterKeys
			})

			return {
				publicKey: keyPairInfo.publicKey,
				privateKey
			}
		}

		const generatedKeyPair = await this.getWorker().crypto.utils.generateKeyPair()

		await this._setKeyPair({
			apiKey,
			publicKey: generatedKeyPair.publicKey,
			privateKey: generatedKeyPair.privateKey,
			masterKeys
		})

		return {
			publicKey: generatedKeyPair.publicKey,
			privateKey: generatedKeyPair.privateKey
		}
	}

	private async _updateKeys({
		apiKey,
		masterKeys,
		authVersion
	}: {
		apiKey: string
		masterKeys: string[]
		authVersion: AuthVersion
	}): Promise<{ masterKeys: string[]; publicKey: string; privateKey: string }> {
		if (authVersion === 1 || authVersion === 2) {
			const currentLastMasterKey = masterKeys.at(-1)

			if (!currentLastMasterKey || currentLastMasterKey.length < 16) {
				throw new Error("Invalid current master key.")
			}

			const encryptedMasterKeys = await this.getWorker().crypto.encrypt.metadata({
				metadata: masterKeys.join("|"),
				key: currentLastMasterKey
			})

			const masterKeysResponse = await this._api.v3().user().masterKeys({
				encryptedMasterKeys,
				apiKey
			})

			const newMasterKeys: string[] = [...masterKeys]

			for (const masterKey of masterKeys) {
				try {
					const decryptedMasterKeys = await this.getWorker().crypto.decrypt.metadata({
						metadata: masterKeysResponse.keys,
						key: masterKey
					})

					if (typeof decryptedMasterKeys === "string" && decryptedMasterKeys.length > 16 && decryptedMasterKeys.includes("|")) {
						for (const key of decryptedMasterKeys.split("|")) {
							if (key.length > 0 && !newMasterKeys.includes(key)) {
								newMasterKeys.push(key)
							}
						}

						break
					}
				} catch {
					continue
				}
			}

			if (newMasterKeys.length === 0) {
				throw new Error("Could not decrypt master keys.")
			}

			const { publicKey, privateKey } = await this.__updateKeyPair({
				apiKey,
				masterKeys: newMasterKeys
			})

			return {
				masterKeys: newMasterKeys,
				publicKey,
				privateKey
			}
		} else if (authVersion === 3) {
			if (masterKeys.length !== 1 || !masterKeys[0]) {
				throw new Error("Invalid master keys array.")
			}

			const dekEncryptionKey = masterKeys[0]

			if (!dekEncryptionKey || dekEncryptionKey.length !== 64) {
				throw new Error("Invalid DEK encryption key.")
			}

			let dek = (
				await this._api.v3().user().getDEK({
					apiKey
				})
			).dek

			if (!dek) {
				dek = (await this.getWorker().crypto.utils.generateRandomBytes(32)).toString("hex")

				await this._api
					.v3()
					.user()
					.setDEK({
						apiKey,
						encryptedDEK: await this.getWorker().crypto.encrypt.metadata({
							metadata: dek,
							key: dekEncryptionKey
						})
					})
			} else {
				dek = await this.getWorker().crypto.decrypt.metadata({
					metadata: dek,
					key: dekEncryptionKey
				})
			}

			const { publicKey, privateKey } = await this.__updateKeyPair({
				apiKey,
				masterKeys: [dek]
			})

			return {
				masterKeys: [dek],
				publicKey,
				privateKey
			}
		} else {
			throw new Error("Invalid authVersion.")
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

		if (emailToUse.length === 0 || passwordToUse.length === 0 || twoFactorCodeToUse.length === 0) {
			throw new Error("Empty email, password or twoFactorCode")
		}

		const authInfo = await this._api.v3().auth().info({
			email: emailToUse
		})
		const authVersion = authInfo.authVersion

		const derived = await this.getWorker().crypto.utils.generatePasswordAndMasterKeyBasedOnAuthVersion({
			rawPassword: passwordToUse,
			authVersion,
			salt: authInfo.salt
		})

		const loginResponse = await this._api.v3().login({
			email: emailToUse,
			password: derived.derivedPassword,
			twoFactorCode: twoFactorCodeToUse,
			authVersion
		})

		const [infoResponse, baseFolderResponse, updateKeys] = await Promise.all([
			this._api.v3().user().info({
				apiKey: loginResponse.apiKey
			}),
			this._api.v3().user().baseFolder({
				apiKey: loginResponse.apiKey
			}),
			this._updateKeys({
				apiKey: loginResponse.apiKey,
				masterKeys: [derived.derivedMasterKeys],
				authVersion
			})
		])

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

export { CloudItem, CloudItemShared, CloudItemFile, CloudItemDirectory, CloudItemTree } from "./cloud"
export { FSItem, FSItemType, FSStats, StatFS, FSConfig } from "./fs"
export * from "./types"
export * from "./constants"
export * from "./api/errors"
export * from "./cloud/signals"
export { SocketEvent } from "./socket"
export { ChunkedUploadWriter } from "./cloud/streams"
