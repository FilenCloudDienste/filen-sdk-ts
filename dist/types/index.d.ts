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
    private readonly config;
    private readonly _api;
    private readonly _crypto;
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
