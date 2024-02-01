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
        health: () => import("./api/v3/health").Health;
        dir: () => {
            content: () => import("./api/v3/dir/content").DirContent;
            download: () => import("./api/v3/dir/download").DirDownload;
            shared: () => import("./api/v3/dir/shared").DirShared;
            linked: () => import("./api/v3/dir/linked").DirLinked;
        };
        auth: () => {
            info: () => import("./api/v3/auth/info").AuthInfo;
        };
        login: () => import("./api/v3/login").Login;
        user: () => {
            info: () => import("./api/v3/user/info").UserInfo;
            baseFolder: () => import("./api/v3/user/baseFolder").UserBaseFolder;
        };
        shared: () => {
            in: () => import("./api/v3/shared/in").SharedIn;
            out: () => import("./api/v3/shared/out").SharedOut;
        };
        upload: () => {
            done: () => import("./api/v3/upload/done").UploadDone;
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
    };
}
export default FilenSDK;
