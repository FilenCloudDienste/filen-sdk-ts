"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilenSDK = void 0;
require("./reactNative");
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
     * @date 2/21/2024 - 8:58:43 AM
     *
     * @constructor
     * @public
     * @param {?FilenSDKConfig} [params]
     */
    constructor(params) {
        this.utils = Object.assign(Object.assign({}, utils_1.default), { crypto: utils_2.default, streams: {
                append: append_1.default,
                decodeBase64: base64_1.streamDecodeBase64,
                encodeBase64: base64_1.streamEncodeBase64
            } });
        if (!params) {
            params = {};
        }
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
            ? new api_1.default({ apiKey: params.apiKey, crypto: this._crypto })
            : new api_1.default({ apiKey: "anonymous", crypto: this._crypto });
        this._cloud = new cloud_1.default({ sdkConfig: params, api: this._api, crypto: this._crypto });
        this._fs = new fs_1.default({ sdkConfig: params, api: this._api, crypto: this._crypto, cloud: this._cloud });
        this._notes = new notes_1.default({ sdkConfig: params, api: this._api, crypto: this._crypto });
        this._chats = new chats_1.default({ sdkConfig: params, api: this._api, crypto: this._crypto });
        this._contacts = new contacts_1.default({ sdkConfig: params, api: this._api });
        this._user = new user_1.default({ sdkConfig: params, api: this._api, crypto: this._crypto });
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
            ? new api_1.default({ apiKey: params.apiKey, crypto: this._crypto })
            : new api_1.default({ apiKey: "anonymous", crypto: this._crypto });
        this._cloud = new cloud_1.default({ sdkConfig: params, api: this._api, crypto: this._crypto });
        this._fs = new fs_1.default({ sdkConfig: params, api: this._api, crypto: this._crypto, cloud: this._cloud });
        this._notes = new notes_1.default({ sdkConfig: params, api: this._api, crypto: this._crypto });
        this._chats = new chats_1.default({ sdkConfig: params, api: this._api, crypto: this._crypto });
        this._contacts = new contacts_1.default({ sdkConfig: params, api: this._api });
        this._user = new user_1.default({ sdkConfig: params, api: this._api, crypto: this._crypto });
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
        const encryptedPrivateKey = await this._crypto.encrypt().metadata({ metadata: privateKey, key: masterKeys[masterKeys.length - 1] });
        await this._api.v3().user().keyPair().update({ publicKey, encryptedPrivateKey, apiKey });
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
        const encryptedPrivateKey = await this._crypto.encrypt().metadata({ metadata: privateKey, key: masterKeys[masterKeys.length - 1] });
        await this._api.v3().user().keyPair().set({ publicKey, encryptedPrivateKey, apiKey });
    }
    async __updateKeyPair({ apiKey, masterKeys }) {
        const keyPairInfo = await this._api.v3().user().keyPair().info({ apiKey });
        if (typeof keyPairInfo.publicKey === "string" &&
            typeof keyPairInfo.privateKey === "string" &&
            keyPairInfo.publicKey.length > 0 &&
            keyPairInfo.privateKey.length > 16) {
            let privateKey = null;
            for (const masterKey of masterKeys) {
                try {
                    const decryptedPrivateKey = await this._crypto.decrypt().metadata({ metadata: keyPairInfo.privateKey, key: masterKey });
                    if (typeof decryptedPrivateKey === "string" && decryptedPrivateKey.length > 16) {
                        privateKey = decryptedPrivateKey;
                    }
                }
                catch (_a) {
                    continue;
                }
            }
            if (!privateKey) {
                throw new Error("Could not decrypt private key.");
            }
            await this._updateKeyPair({ apiKey, publicKey: keyPairInfo.publicKey, privateKey, masterKeys });
            return {
                publicKey: keyPairInfo.publicKey,
                privateKey
            };
        }
        const generatedKeyPair = await this._crypto.utils.generateKeyPair();
        await this._setKeyPair({ apiKey, publicKey: generatedKeyPair.publicKey, privateKey: generatedKeyPair.privateKey, masterKeys });
        return {
            publicKey: generatedKeyPair.publicKey,
            privateKey: generatedKeyPair.privateKey
        };
    }
    async _updateKeys({ apiKey, masterKeys }) {
        const encryptedMasterKeys = await this._crypto
            .encrypt()
            .metadata({ metadata: masterKeys.join("|"), key: masterKeys[masterKeys.length - 1] });
        const masterKeysResponse = await this._api.v3().user().masterKeys({ encryptedMasterKeys, apiKey });
        let newMasterKeys = [...masterKeys];
        for (const masterKey of masterKeys) {
            try {
                const decryptedMasterKeys = await this._crypto.decrypt().metadata({ metadata: masterKeysResponse.keys, key: masterKey });
                if (typeof decryptedMasterKeys === "string" && decryptedMasterKeys.length > 16 && decryptedMasterKeys.includes("|")) {
                    newMasterKeys = [...masterKeys, ...decryptedMasterKeys.split("|")];
                }
            }
            catch (_a) {
                continue;
            }
        }
        if (newMasterKeys.length === 0) {
            throw new Error("Could not decrypt master keys.");
        }
        const { publicKey, privateKey } = await this.__updateKeyPair({ apiKey, masterKeys: newMasterKeys });
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
        let authVersion = this.config.authVersion ? this.config.authVersion : null;
        if (emailToUse.length === 0 || passwordToUse.length === 0 || twoFactorCodeToUse.length === 0) {
            throw new Error("Empty email, password or twoFactorCode");
        }
        const authInfo = await this._api.v3().auth().info({ email: emailToUse });
        if (!authVersion) {
            authVersion = authInfo.authVersion;
        }
        const derived = await this._crypto.utils.generatePasswordAndMasterKeyBasedOnAuthVersion({
            rawPassword: passwordToUse,
            authVersion: authInfo.authVersion,
            salt: authInfo.salt
        });
        const loginResponse = await this._api.v3().login({ email: emailToUse, password: derived.derivedPassword, authVersion });
        const [infoResponse, baseFolderResponse] = await Promise.all([
            this._api.v3().user().info({ apiKey: loginResponse.apiKey }),
            this._api.v3().user().baseFolder({ apiKey: loginResponse.apiKey })
        ]);
        const updateKeys = await this._updateKeys({ apiKey: loginResponse.apiKey, masterKeys: [derived.derivedMasterKeys] });
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
    /**
     * Returns an instance of the API based on the given version (Current version: 3).
     * @date 2/19/2024 - 6:34:03 AM
     *
     * @public
     * @param {number} version
     * @returns {ReturnType<typeof this._api.v3>}
     */
    api(version) {
        if (!this.isLoggedIn()) {
            throw new Error("Not authenticated, please call login() first");
        }
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
        if (!this.isLoggedIn()) {
            throw new Error("Not authenticated, please call login() first");
        }
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
module.exports = FilenSDK;
exports.default = FilenSDK;
//# sourceMappingURL=index.js.map