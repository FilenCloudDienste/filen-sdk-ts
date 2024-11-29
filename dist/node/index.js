"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkedUploadWriter = exports.FilenSDK = void 0;
const api_1 = __importDefault(require("./api"));
const crypto_1 = __importDefault(require("./crypto"));
const utils_1 = __importDefault(require("./utils"));
const constants_1 = require("./constants");
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("./fs"));
const append_1 = __importDefault(require("./streams/append"));
const base64_1 = require("./streams/base64");
const utils_2 = __importDefault(require("./crypto/utils"));
const cloud_1 = __importDefault(require("./cloud"));
const path_1 = __importDefault(require("path"));
const chats_1 = __importDefault(require("./chats"));
const notes_1 = __importDefault(require("./notes"));
const contacts_1 = __importDefault(require("./contacts"));
const user_1 = __importDefault(require("./user"));
const socket_1 = __importDefault(require("./socket"));
const events_1 = __importDefault(require("./events"));
const axios_1 = __importDefault(require("axios"));
/**
 * FilenSDK
 * @date 2/1/2024 - 2:45:02 AM
 *
 * @export
 * @class FilenSDK
 * @typedef {FilenSDK}
 */
class FilenSDK {
    /**
     * Creates an instance of FilenSDK.
     *
     * @constructor
     * @public
     * @param {?FilenSDKConfig} [params]
     * @param {?SDKWorker[]} [workers]
     * @param {?AxiosInstance} [axiosInstance]
     */
    constructor(params, workers, axiosInstance) {
        this.socket = new socket_1.default();
        this._updateKeyPairTries = 0;
        this.currentWorkerWorkIndex = 0;
        this.utils = Object.assign(Object.assign({}, utils_1.default), { crypto: utils_2.default, streams: {
                append: append_1.default,
                decodeBase64: base64_1.streamDecodeBase64,
                encodeBase64: base64_1.streamEncodeBase64
            } });
        if (!params) {
            params = {};
        }
        this.config = params;
        this.workers = workers ? workers : null;
        this.events = new events_1.default();
        this.axiosInstance = axiosInstance ? axiosInstance : axios_1.default.create();
        this._crypto =
            params.masterKeys && params.publicKey && params.privateKey
                ? new crypto_1.default({
                    masterKeys: params.masterKeys,
                    publicKey: params.publicKey,
                    privateKey: params.privateKey,
                    metadataCache: params.metadataCache ? params.metadataCache : false,
                    tmpPath: constants_1.environment === "browser"
                        ? "/dev/null"
                        : params.tmpPath
                            ? utils_1.default.normalizePath(params.tmpPath)
                            : utils_1.default.normalizePath(os_1.default.tmpdir())
                })
                : new crypto_1.default({
                    masterKeys: [],
                    publicKey: "",
                    privateKey: "",
                    metadataCache: params.metadataCache ? params.metadataCache : false,
                    tmpPath: constants_1.environment === "browser"
                        ? "/dev/null"
                        : params.tmpPath
                            ? utils_1.default.normalizePath(params.tmpPath)
                            : utils_1.default.normalizePath(os_1.default.tmpdir())
                });
        this._api = params.apiKey
            ? new api_1.default({
                apiKey: params.apiKey,
                sdk: this
            })
            : new api_1.default({
                apiKey: "anonymous",
                sdk: this
            });
        this._cloud = new cloud_1.default({
            sdkConfig: params,
            api: this._api,
            sdk: this
        });
        this._fs = new fs_1.default({
            sdkConfig: params,
            api: this._api,
            cloud: this._cloud,
            connectToSocket: params.connectToSocket
        });
        this._notes = new notes_1.default({
            sdkConfig: params,
            api: this._api,
            sdk: this
        });
        this._chats = new chats_1.default({
            sdkConfig: params,
            api: this._api,
            sdk: this
        });
        this._contacts = new contacts_1.default({
            sdkConfig: params,
            api: this._api
        });
        this._user = new user_1.default({
            sdkConfig: params,
            api: this._api,
            sdk: this
        });
    }
    /**
     * Update the SDK Worker pool.
     *
     * @public
     * @param {SDKWorker[]} sdkWorkers
     */
    setSDKWorkers(sdkWorkers) {
        this.workers = sdkWorkers;
    }
    getBaseWorker() {
        const baseWorker = {
            crypto: {
                encrypt: this.crypto().encrypt(),
                decrypt: this.crypto().decrypt(),
                utils: utils_2.default
            },
            api: {
                v3: {
                    file: {
                        upload: {
                            chunk: {
                                buffer: {
                                    fetch: params => {
                                        return this._api.v3().file().upload().chunk().buffer(params);
                                    }
                                }
                            }
                        },
                        download: {
                            chunk: {
                                buffer: {
                                    fetch: params => {
                                        return this._api.v3().file().download().chunk().buffer(params);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        return baseWorker;
    }
    /**
     * Get a worker from the SDK Worker pool if set. Greatly improves performance.
     *
     * @public
     * @returns {SDKWorker}
     */
    getWorker() {
        const baseWorker = {
            crypto: {
                encrypt: this.crypto().encrypt(),
                decrypt: this.crypto().decrypt(),
                utils: utils_2.default
            },
            api: {
                v3: {
                    file: {
                        upload: {
                            chunk: {
                                buffer: {
                                    fetch: params => {
                                        return this._api.v3().file().upload().chunk().buffer(params);
                                    }
                                }
                            }
                        },
                        download: {
                            chunk: {
                                buffer: {
                                    fetch: params => {
                                        return this._api.v3().file().download().chunk().buffer(params);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        if (!this.workers || this.workers.length === 0) {
            return baseWorker;
        }
        if (this.currentWorkerWorkIndex === undefined ||
            this.currentWorkerWorkIndex < 0 ||
            this.currentWorkerWorkIndex >= this.workers.length) {
            this.currentWorkerWorkIndex = 0;
        }
        const workerToUse = this.workers[this.currentWorkerWorkIndex];
        this.currentWorkerWorkIndex = (this.currentWorkerWorkIndex + 1) % this.workers.length;
        return workerToUse || baseWorker;
    }
    /**
     * Initialize the SDK again (after logging in for example).
     * @date 2/1/2024 - 3:23:58 PM
     *
     * @public
     * @param {FilenSDKConfig} params
     */
    init(params) {
        this.config = params;
        this._crypto =
            params.masterKeys && params.publicKey && params.privateKey
                ? new crypto_1.default({
                    masterKeys: params.masterKeys,
                    publicKey: params.publicKey,
                    privateKey: params.privateKey,
                    metadataCache: params.metadataCache ? params.metadataCache : false,
                    tmpPath: constants_1.environment === "browser"
                        ? "/dev/null"
                        : params.tmpPath
                            ? utils_1.default.normalizePath(params.tmpPath)
                            : utils_1.default.normalizePath(os_1.default.tmpdir())
                })
                : new crypto_1.default({
                    masterKeys: [],
                    publicKey: "",
                    privateKey: "",
                    metadataCache: params.metadataCache ? params.metadataCache : false,
                    tmpPath: constants_1.environment === "browser"
                        ? "/dev/null"
                        : params.tmpPath
                            ? utils_1.default.normalizePath(params.tmpPath)
                            : utils_1.default.normalizePath(os_1.default.tmpdir())
                });
        this._api = params.apiKey
            ? new api_1.default({
                apiKey: params.apiKey,
                sdk: this
            })
            : new api_1.default({
                apiKey: "anonymous",
                sdk: this
            });
        this._cloud = new cloud_1.default({
            sdkConfig: params,
            api: this._api,
            sdk: this
        });
        this._fs = new fs_1.default({
            sdkConfig: params,
            api: this._api,
            cloud: this._cloud,
            connectToSocket: params.connectToSocket
        });
        this._notes = new notes_1.default({
            sdkConfig: params,
            api: this._api,
            sdk: this
        });
        this._chats = new chats_1.default({
            sdkConfig: params,
            api: this._api,
            sdk: this
        });
        this._contacts = new contacts_1.default({
            sdkConfig: params,
            api: this._api
        });
        this._user = new user_1.default({
            sdkConfig: params,
            api: this._api,
            sdk: this
        });
    }
    /**
     * Check if the SDK user is authenticated.
     * @date 1/31/2024 - 4:08:17 PM
     *
     * @private
     * @returns {boolean}
     */
    isLoggedIn() {
        return (typeof this.config.apiKey !== "undefined" &&
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
            [1, 2].includes(this.config.authVersion));
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
    async _updateKeyPair({ apiKey, publicKey, privateKey, masterKeys }) {
        const encryptedPrivateKey = await this.getWorker().crypto.encrypt.metadata({
            metadata: privateKey,
            key: masterKeys[masterKeys.length - 1]
        });
        await this._api.v3().user().keyPair().update({
            publicKey,
            encryptedPrivateKey,
            apiKey
        });
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
    async _setKeyPair({ apiKey, publicKey, privateKey, masterKeys }) {
        const encryptedPrivateKey = await this.getWorker().crypto.encrypt.metadata({
            metadata: privateKey,
            key: masterKeys[masterKeys.length - 1]
        });
        await this._api.v3().user().keyPair().set({
            publicKey,
            encryptedPrivateKey,
            apiKey
        });
    }
    async __updateKeyPair({ apiKey, masterKeys }) {
        const keyPairInfo = await this._api.v3().user().keyPair().info({ apiKey });
        if (typeof keyPairInfo.publicKey === "string" &&
            typeof keyPairInfo.privateKey === "string" &&
            keyPairInfo.publicKey.length > 0 &&
            keyPairInfo.privateKey.length > 0) {
            let privateKey = null;
            for (const masterKey of masterKeys) {
                try {
                    const decryptedPrivateKey = await this.getWorker().crypto.decrypt.metadata({
                        metadata: keyPairInfo.privateKey,
                        key: masterKey
                    });
                    if (typeof decryptedPrivateKey === "string" && decryptedPrivateKey.length > 16) {
                        privateKey = decryptedPrivateKey;
                        break;
                    }
                }
                catch (_a) {
                    continue;
                }
            }
            if (!privateKey) {
                // If the user for example changed his password and did not properly import the old master keys, it could be that we cannot decrypt the private key anymore.
                // We try to decrypt it 3 times (might be network/API related) and if it still does not work, we generate a new keypair.
                if (this._updateKeyPairTries < 3) {
                    this._updateKeyPairTries += 1;
                    await new Promise(resolve => setTimeout(resolve, 250));
                    return await this.__updateKeyPair({
                        apiKey,
                        masterKeys
                    });
                }
                const generatedKeyPair = await this.getWorker().crypto.utils.generateKeyPair();
                await this._updateKeyPair({
                    apiKey,
                    publicKey: generatedKeyPair.publicKey,
                    privateKey: generatedKeyPair.privateKey,
                    masterKeys
                });
                return {
                    publicKey: generatedKeyPair.publicKey,
                    privateKey: generatedKeyPair.privateKey
                };
            }
            await this._updateKeyPair({
                apiKey,
                publicKey: keyPairInfo.publicKey,
                privateKey,
                masterKeys
            });
            return {
                publicKey: keyPairInfo.publicKey,
                privateKey
            };
        }
        const generatedKeyPair = await this.getWorker().crypto.utils.generateKeyPair();
        await this._setKeyPair({
            apiKey,
            publicKey: generatedKeyPair.publicKey,
            privateKey: generatedKeyPair.privateKey,
            masterKeys
        });
        return {
            publicKey: generatedKeyPair.publicKey,
            privateKey: generatedKeyPair.privateKey
        };
    }
    async _updateKeys({ apiKey, masterKeys }) {
        const currentLastMasterKey = masterKeys[masterKeys.length - 1];
        if (!currentLastMasterKey || currentLastMasterKey.length < 16) {
            throw new Error("Invalid current master key.");
        }
        const encryptedMasterKeys = await this.getWorker().crypto.encrypt.metadata({
            metadata: masterKeys.join("|"),
            key: currentLastMasterKey
        });
        const masterKeysResponse = await this._api.v3().user().masterKeys({
            encryptedMasterKeys,
            apiKey
        });
        const newMasterKeys = [...masterKeys];
        for (const masterKey of masterKeys) {
            try {
                const decryptedMasterKeys = await this.getWorker().crypto.decrypt.metadata({
                    metadata: masterKeysResponse.keys,
                    key: masterKey
                });
                if (typeof decryptedMasterKeys === "string" && decryptedMasterKeys.length > 16 && decryptedMasterKeys.includes("|")) {
                    for (const key of decryptedMasterKeys.split("|")) {
                        if (key.length > 0 && !newMasterKeys.includes(key)) {
                            newMasterKeys.push(key);
                        }
                    }
                    break;
                }
            }
            catch (_a) {
                continue;
            }
        }
        if (newMasterKeys.length === 0) {
            throw new Error("Could not decrypt master keys.");
        }
        const { publicKey, privateKey } = await this.__updateKeyPair({
            apiKey,
            masterKeys: newMasterKeys
        });
        return {
            masterKeys: newMasterKeys,
            publicKey,
            privateKey
        };
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
    async login({ email, password, twoFactorCode }) {
        const emailToUse = email ? email : this.config.email ? this.config.email : "";
        const passwordToUse = password ? password : this.config.password ? this.config.password : "";
        const twoFactorCodeToUse = twoFactorCode ? twoFactorCode : this.config.twoFactorCode ? this.config.twoFactorCode : "XXXXXX";
        if (emailToUse.length === 0 || passwordToUse.length === 0 || twoFactorCodeToUse.length === 0) {
            throw new Error("Empty email, password or twoFactorCode");
        }
        const authInfo = await this._api.v3().auth().info({ email: emailToUse });
        const authVersion = authInfo.authVersion;
        const derived = await this.getWorker().crypto.utils.generatePasswordAndMasterKeyBasedOnAuthVersion({
            rawPassword: passwordToUse,
            authVersion: authInfo.authVersion,
            salt: authInfo.salt
        });
        const loginResponse = await this._api.v3().login({
            email: emailToUse,
            password: derived.derivedPassword,
            twoFactorCode: twoFactorCodeToUse,
            authVersion
        });
        const [infoResponse, baseFolderResponse] = await Promise.all([
            this._api.v3().user().info({ apiKey: loginResponse.apiKey }),
            this._api.v3().user().baseFolder({ apiKey: loginResponse.apiKey })
        ]);
        const updateKeys = await this._updateKeys({
            apiKey: loginResponse.apiKey,
            masterKeys: [derived.derivedMasterKeys]
        });
        this.init(Object.assign(Object.assign({}, this.config), { email: emailToUse, password: passwordToUse, twoFactorCode: twoFactorCodeToUse, masterKeys: updateKeys.masterKeys, apiKey: loginResponse.apiKey, publicKey: updateKeys.publicKey, privateKey: updateKeys.privateKey, authVersion, baseFolderUUID: baseFolderResponse.uuid, userId: infoResponse.id }));
    }
    /**
     * Logout.
     * @date 2/9/2024 - 5:48:28 AM
     *
     * @public
     */
    logout() {
        this.init(Object.assign(Object.assign({}, this.config), { email: undefined, password: undefined, twoFactorCode: undefined, masterKeys: undefined, apiKey: undefined, publicKey: undefined, privateKey: undefined, authVersion: undefined, baseFolderUUID: undefined, userId: undefined }));
    }
    api(version) {
        // if (!this.isLoggedIn()) {
        // 	throw new Error("Not authenticated, please call login() first")
        // }
        if (version === 3) {
            return this._api.v3();
        }
        throw new Error(`API version ${version} does not exist`);
    }
    /**
     * Returns an instance of Crypto.
     * @date 1/31/2024 - 4:29:49 PM
     *
     * @public
     * @returns {Crypto}
     */
    crypto() {
        // if (!this.isLoggedIn()) {
        // 	throw new Error("Not authenticated, please call login() first")
        // }
        return this._crypto;
    }
    /**
     * Returns an instance of FS.
     * @date 2/17/2024 - 1:52:12 AM
     *
     * @public
     * @returns {FS}
     */
    fs() {
        if (!this.isLoggedIn()) {
            throw new Error("Not authenticated, please call login() first");
        }
        return this._fs;
    }
    /**
     * Returns an instance of Cloud.
     * @date 2/17/2024 - 1:52:05 AM
     *
     * @public
     * @returns {Cloud}
     */
    cloud() {
        if (!this.isLoggedIn()) {
            throw new Error("Not authenticated, please call login() first");
        }
        return this._cloud;
    }
    /**
     * Returns an instance of Notes.
     * @date 2/19/2024 - 6:32:35 AM
     *
     * @public
     * @returns {Notes}
     */
    notes() {
        if (!this.isLoggedIn()) {
            throw new Error("Not authenticated, please call login() first");
        }
        return this._notes;
    }
    /**
     * Returns an instance of Chats.
     * @date 2/19/2024 - 6:32:35 AM
     *
     * @public
     * @returns {Chats}
     */
    chats() {
        if (!this.isLoggedIn()) {
            throw new Error("Not authenticated, please call login() first");
        }
        return this._chats;
    }
    /**
     * Returns an instance of Contacts.
     * @date 2/20/2024 - 6:27:05 AM
     *
     * @public
     * @returns {Contacts}
     */
    contacts() {
        if (!this.isLoggedIn()) {
            throw new Error("Not authenticated, please call login() first");
        }
        return this._contacts;
    }
    /**
     * Return an instance of User.
     * @date 2/20/2024 - 6:27:17 AM
     *
     * @public
     * @returns {User}
     */
    user() {
        if (!this.isLoggedIn()) {
            throw new Error("Not authenticated, please call login() first");
        }
        return this._user;
    }
    /**
     * Clear the temporary directory. Only available in a Node.JS environment.
     * @date 2/17/2024 - 1:51:39 AM
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    async clearTemporaryDirectory() {
        if (constants_1.environment !== "node") {
            return;
        }
        const tmpDir = utils_1.default.normalizePath(path_1.default.join(this.config.tmpPath ? this.config.tmpPath : os_1.default.tmpdir(), "filen-sdk"));
        await utils_1.default.clearTempDirectory({ tmpDir });
    }
}
exports.FilenSDK = FilenSDK;
exports.default = FilenSDK;
__exportStar(require("./types"), exports);
__exportStar(require("./constants"), exports);
__exportStar(require("./api/errors"), exports);
__exportStar(require("./cloud/signals"), exports);
var streams_1 = require("./cloud/streams");
Object.defineProperty(exports, "ChunkedUploadWriter", { enumerable: true, get: function () { return streams_1.ChunkedUploadWriter; } });
//# sourceMappingURL=index.js.map