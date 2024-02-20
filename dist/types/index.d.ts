import "./reactNative";
import type { AuthVersion } from "./types";
import Crypto from "./crypto";
import FS from "./fs";
import appendStream from "./streams/append";
import { streamDecodeBase64, streamEncodeBase64 } from "./streams/base64";
import Cloud from "./cloud";
import Chats from "./chats";
import Notes from "./notes";
import Contacts from "./contacts";
import User from "./user";
export type FilenSDKConfig = {
    email?: string;
    password?: string;
    twoFactorCode?: string;
    masterKeys?: string[];
    apiKey?: string;
    publicKey?: string;
    privateKey?: string;
    authVersion?: AuthVersion;
    baseFolderUUID?: string;
    userId?: number;
    metadataCache?: boolean;
    tmpPath?: string;
};
/**
 * FilenSDK
 * @date 2/1/2024 - 2:45:02 AM
 *
 * @export
 * @class FilenSDK
 * @typedef {FilenSDK}
 */
export declare class FilenSDK {
    private config;
    private _api;
    private _crypto;
    private _fs;
    private _cloud;
    private _notes;
    private _chats;
    private _contacts;
    private _user;
    /**
     * Creates an instance of FilenSDK.
     * @date 1/31/2024 - 4:04:52 PM
     *
     * @constructor
     * @public
     * @param {FilenSDKConfig} params
     */
    constructor(params: FilenSDKConfig);
    /**
     * Initialize the SDK again (after logging in for example).
     * @date 2/1/2024 - 3:23:58 PM
     *
     * @public
     * @param {FilenSDKConfig} params
     */
    init(params: FilenSDKConfig): void;
    /**
     * Check if the SDK user is authenticated.
     * @date 1/31/2024 - 4:08:17 PM
     *
     * @private
     * @returns {boolean}
     */
    private isLoggedIn;
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
    private _updateKeyPair;
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
    private _setKeyPair;
    private __updateKeyPair;
    private _updateKeys;
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
    login({ email, password, twoFactorCode }: {
        email?: string;
        password?: string;
        twoFactorCode?: string;
    }): Promise<void>;
    /**
     * Logout.
     * @date 2/9/2024 - 5:48:28 AM
     *
     * @public
     */
    logout(): void;
    /**
     * Returns an instance of the API based on the given version (Current version: 3).
     * @date 2/19/2024 - 6:34:03 AM
     *
     * @public
     * @param {number} version
     * @returns {ReturnType<typeof this._api.v3>}
     */
    api(version: number): ReturnType<typeof this._api.v3>;
    /**
     * Returns an instance of Crypto.
     * @date 1/31/2024 - 4:29:49 PM
     *
     * @public
     * @returns {Crypto}
     */
    crypto(): Crypto;
    /**
     * Returns an instance of FS.
     * @date 2/17/2024 - 1:52:12 AM
     *
     * @public
     * @returns {FS}
     */
    fs(): FS;
    /**
     * Returns an instance of Cloud.
     * @date 2/17/2024 - 1:52:05 AM
     *
     * @public
     * @returns {Cloud}
     */
    cloud(): Cloud;
    /**
     * Returns an instance of Notes.
     * @date 2/19/2024 - 6:32:35 AM
     *
     * @public
     * @returns {Notes}
     */
    notes(): Notes;
    /**
     * Returns an instance of Chats.
     * @date 2/19/2024 - 6:32:35 AM
     *
     * @public
     * @returns {Chats}
     */
    chats(): Chats;
    /**
     * Returns an instance of Contacts.
     * @date 2/20/2024 - 6:27:05 AM
     *
     * @public
     * @returns {Contacts}
     */
    contacts(): Contacts;
    /**
     * Return an instance of User.
     * @date 2/20/2024 - 6:27:17 AM
     *
     * @public
     * @returns {User}
     */
    user(): User;
    /**
     * Clear the temporary directory. Only available in a Node.JS environment.
     * @date 2/17/2024 - 1:51:39 AM
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    clearTemporaryDirectory(): Promise<void>;
    readonly utils: {
        crypto: {
            generateRandomString: typeof import("./crypto/utils").generateRandomString;
            deriveKeyFromPassword: typeof import("./crypto/utils").deriveKeyFromPassword;
            hashFn: typeof import("./crypto/utils").hashFn;
            generatePasswordAndMasterKeyBasedOnAuthVersion: typeof import("./crypto/utils").generatePasswordAndMasterKeyBasedOnAuthVersion;
            hashPassword: typeof import("./crypto/utils").hashPassword;
            derKeyToPem: typeof import("./crypto/utils").derKeyToPem;
            importPublicKey: typeof import("./crypto/utils").importPublicKey;
            importPrivateKey: typeof import("./crypto/utils").importPrivateKey;
            bufferToHash: typeof import("./crypto/utils").bufferToHash;
            generateKeyPair: typeof import("./crypto/utils").generateKeyPair;
            importRawKey: typeof import("./crypto/utils").importRawKey;
            importPBKDF2Key: typeof import("./crypto/utils").importPBKDF2Key;
        };
        streams: {
            append: typeof appendStream;
            decodeBase64: typeof streamDecodeBase64;
            encodeBase64: typeof streamEncodeBase64;
        };
        sleep: typeof import("./utils").sleep;
        /**
         * Check if the SDK user is authenticated.
         * @date 1/31/2024 - 4:08:17 PM
         *
         * @private
         * @returns {boolean}
         */
        convertTimestampToMs: typeof import("./utils").convertTimestampToMs;
        normalizePath: typeof import("./utils").normalizePath;
        uuidv4: typeof import("./utils").uuidv4;
        Uint8ArrayConcat: typeof import("./utils").Uint8ArrayConcat;
        promiseAllChunked: typeof import("./utils").promiseAllChunked;
        getRandomArbitrary: typeof import("./utils").getRandomArbitrary;
        clearTempDirectory: typeof import("./utils").clearTempDirectory;
        parseURLParams: typeof import("./utils").parseURLParams;
        getEveryPossibleDirectoryPath: typeof import("./utils").getEveryPossibleDirectoryPath;
        simpleDate: typeof import("./utils").simpleDate;
    };
}
export default FilenSDK;
