import "./reactNative";
import type { AuthVersion } from "./types";
import Crypto from "./crypto";
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
     * Authenticate.
     * @date 1/31/2024 - 4:08:44 PM
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    login(): Promise<void>;
    /**
     * Returns an instance of the API wrapper based on the given API version.
     * @date 1/31/2024 - 4:28:59 PM
     *
     * @public
     * @param {number} version
     * @returns {*}
     */
    api(version: number): {
        health: () => Promise<"OK">;
        dir: () => {
            content: (params_0: {
                uuid: string;
                dirsOnly?: boolean | undefined;
            }) => Promise<import("./api/v3/dir/content").DirContentResponse>;
            download: (params_0: {
                uuid: string;
                type?: import("./api/v3/dir/download").DirDownloadType | undefined;
                linkUUID?: string | undefined;
                linkHasPassword?: boolean | undefined;
                linkPassword?: string | undefined;
                linkSalt?: string | undefined;
            }) => Promise<import("./api/v3/dir/download").DirDownloadResponse>;
            shared: (params_0: {
                uuid: string;
            }) => Promise<import("./api/v3/dir/shared").DirSharedResponse>;
            linked: (params_0: {
                uuid: string;
            }) => Promise<import("./api/v3/dir/linked").DirLinkedResponse>;
        };
        auth: () => {
            info: (params_0: {
                email: string;
            }) => Promise<import("./api/v3/auth/info").AuthInfoResponse>;
        };
        login: (params_0: {
            email: string;
            password: string;
            twoFactorCode?: string | undefined;
            authVersion: AuthVersion;
        }) => Promise<import("./api/v3/login").LoginResponse>;
        user: () => {
            info: () => Promise<import("./api/v3/user/info").UserInfoResponse>;
            baseFolder: () => Promise<import("./api/v3/user/baseFolder").UserBaseFolderResponse>;
        };
        shared: () => {
            in: (params?: {
                uuid?: string | undefined;
            } | undefined) => Promise<import("./api/v3/shared/in").SharedInResponse>;
            out: (params?: {
                uuid?: string | undefined;
                receiverId?: number | undefined;
            } | undefined) => Promise<import("./api/v3/shared/out").SharedOutResponse>;
        };
        upload: () => {
            done: (params_0: {
                uuid: string;
                name: string;
                nameHashed: string;
                size: string;
                chunks: number;
                mime: string;
                rm: string;
                metadata: string;
                version: import("./types").FileEncryptionVersion;
                uploadKey: string;
            }) => Promise<import("./api/v3/upload/done").UploadDoneResponse>;
        };
    };
    /**
     * Returns a Filen Crypto instance.
     * @date 1/31/2024 - 4:29:49 PM
     *
     * @public
     * @returns {Crypto}
     */
    crypto(): Crypto;
    readonly utils: {
        sleep: typeof import("./utils").sleep;
        convertTimestampToMs: typeof import("./utils").convertTimestampToMs;
        normalizePath: typeof import("./utils").normalizePath;
        uuidv4: typeof import("./utils").uuidv4;
        Uint8ArrayConcat: typeof import("./utils").Uint8ArrayConcat;
    };
}
export default FilenSDK;
