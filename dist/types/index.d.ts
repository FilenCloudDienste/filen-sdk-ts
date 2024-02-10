/// <reference types="node" />
import "./reactNative";
import type { AuthVersion } from "./types";
import Crypto from "./crypto";
import FS from "./fs";
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
     * Logout.
     * @date 2/9/2024 - 5:48:28 AM
     *
     * @public
     */
    logout(): void;
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
            link: () => {
                add: (params_0: {
                    uuid: string;
                    parent: string;
                    linkUUID: string;
                    type: string;
                    metadata: string;
                    key: string;
                    expiration: string;
                }) => Promise<void>;
                status: (params_0: {
                    uuid: string;
                }) => Promise<import("./api/v3/dir/link/status").DirLinkStatusResponse>;
                remove: (params_0: {
                    uuid: string;
                }) => Promise<void>;
                edit: (params_0: {
                    uuid: string;
                    expiration?: import("./api/v3/dir/link/edit").DirLinkEditExpiration | undefined;
                    password?: string | undefined;
                    downloadBtn?: boolean | undefined;
                }) => Promise<void>;
                info: (params_0: {
                    uuid: string;
                }) => Promise<import("./api/v3/dir/link/info").DirLinkInfoResponse>;
                content: (params_0: {
                    uuid: string;
                    password: string;
                    parent: string;
                }) => Promise<import("./api/v3/dir/link/content").DirLinkContentResponse>;
            };
            exists: (params_0: {
                name: string;
                parent: string;
            }) => Promise<import("./api/v3/dir/exists").DirExistsResponse>;
            create: (params_0: {
                uuid?: string | undefined;
                name: string;
                parent: string;
            }) => Promise<import("./api/v3/dir/create").DirCreateResponse>;
            present: (params_0: {
                uuid: string;
            }) => Promise<import("./api/v3/dir/present").DirPresentResponse>;
            trash: (params_0: {
                uuid: string;
            }) => Promise<void>;
            move: (params_0: {
                uuid: string;
                to: string;
            }) => Promise<void>;
            rename: (params_0: {
                uuid: string;
                name: string;
            }) => Promise<void>;
            size: (params_0: {
                uuid: string;
                sharerId?: number | undefined;
                receiverId?: number | undefined;
                trash?: boolean | undefined;
            }) => Promise<import("./api/v3/dir/size").DirSizeResponse>;
            sizeLink: (params_0: {
                uuid: string;
                linkUUID: string;
            }) => Promise<import("./api/v3/dir/sizeLink").DirSizeLinkResponse>;
            delete: () => {
                permanent: (params_0: {
                    uuid: string;
                }) => Promise<void>;
            };
            restore: (params_0: {
                uuid: string;
            }) => Promise<void>;
            color: (params_0: {
                uuid: string;
                color: import("./api/v3/dir/color").DirColors;
            }) => Promise<void>;
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
            publicKey: (params_0: {
                email: string;
            }) => Promise<import("./api/v3/user/publicKey").UserPublicKeyResponse>;
            settings: () => Promise<import("./api/v3/user/settings").UserSettingsResponse>;
            account: () => Promise<import("./api/v3/user/account").UserAccountResponse>;
            gdpr: () => Promise<import("./api/v3/user/gdpr").UserGDPRResponse>;
            avatar: (params_0: {
                buffer: Buffer;
            }) => Promise<void>;
            settingsEmail: () => {
                change: (params_0: {
                    email: string;
                    password: string;
                    authVersion: AuthVersion;
                }) => Promise<void>;
            };
            personal: () => {
                change: (params_0: {
                    city?: string | undefined;
                    companyName?: string | undefined;
                    country?: string | undefined;
                    firstName?: string | undefined;
                    lastName?: string | undefined;
                    postalCode?: string | undefined;
                    street?: string | undefined;
                    streetNumber?: string | undefined;
                    vatId?: string | undefined;
                }) => Promise<void>;
            };
            delete: (params_0: {
                twoFactorCode?: string | undefined;
            }) => Promise<void>;
            deleteVersions: () => Promise<void>;
            deleteAll: () => Promise<void>;
            settingsPassword: () => {
                change: (params_0: {
                    password: string;
                    currentPassword: string;
                    authVersion: AuthVersion;
                    salt: string;
                    masterKeys: string;
                }) => Promise<import("./api/v3/user/settings/password/change").UserSettingsPasswordChangeResponse>;
            };
            twoFactorAuthentication: () => {
                enable: (params_0: {
                    code: string;
                }) => Promise<import("./api/v3/user/2fa/enable").User2FAEnableResponse>;
                disable: (params_0: {
                    code: string;
                }) => Promise<void>;
            };
            events: (params_0: {
                lastTimestamp?: number | undefined;
                filter?: string | undefined;
            }) => Promise<import("./api/v3/user/events").UserEvent[]>;
            event: (params_0: {
                uuid: string;
            }) => Promise<import("./api/v3/user/event").UserEventResponse>;
            sub: () => {
                cancel: (params_0: {
                    uuid: string;
                }) => Promise<void>;
                create: (params_0: {
                    planId: number;
                    method: import("./api/v3/user/sub/create").PaymentMethods;
                }) => Promise<import("./api/v3/user/sub/create").UserSubCreateResponse>;
            };
            invoice: (params_0: {
                uuid: string;
            }) => Promise<string>;
            affiliate: () => {
                payout: (params_0: {
                    address: string;
                    method: string;
                }) => Promise<void>;
            };
            versioning: (params_0: {
                enable: boolean;
            }) => Promise<void>;
            loginAlerts: (params_0: {
                enable: boolean;
            }) => Promise<void>;
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
        item: () => {
            share: (params_0: {
                uuid: string;
                parent: string;
                email: string;
                type: string;
                metadata: string;
            }) => Promise<void>;
            shared: (params_0: {
                uuid: string;
            }) => Promise<import("./api/v3/item/shared").ItemSharedResponse>;
            linked: (params_0: {
                uuid: string;
            }) => Promise<import("./api/v3/item/linked").ItemLinkedResponse>;
            linkedRename: (params_0: {
                uuid: string;
                linkUUID: string;
                metadata: string;
            }) => Promise<void>;
            sharedRename: (params_0: {
                uuid: string;
                receiverId: number;
                metadata: string;
            }) => Promise<void>;
            favorite: (params_0: {
                uuid: string;
                type: "file" | "folder";
                favorite: boolean;
            }) => Promise<void>;
            sharedOut: () => {
                remove: (params_0: {
                    uuid: string;
                    receiverId: number;
                }) => Promise<void>;
            };
            sharedIn: () => {
                remove: (params_0: {
                    uuid: string;
                }) => Promise<void>;
            };
        };
        file: () => {
            exists: (params_0: {
                name: string;
                parent: string;
            }) => Promise<import("./api/v3/file/exists").FileExistsResponse>;
            trash: (params_0: {
                uuid: string;
            }) => Promise<void>;
            move: (params_0: {
                uuid: string;
                to: string;
            }) => Promise<void>;
            rename: (params_0: {
                uuid: string;
                metadata: import("./types").FileMetadata;
                name: string;
            }) => Promise<void>;
            delete: () => {
                permanent: (params_0: {
                    uuid: string;
                }) => Promise<void>;
            };
            restore: (params_0: {
                uuid: string;
            }) => Promise<void>;
            version: () => {
                restore: (params_0: {
                    uuid: string;
                    currentUUID: string;
                }) => Promise<void>;
            };
            link: () => {
                status: (params_0: {
                    uuid: string;
                }) => Promise<import("./api/v3/file/link/status").FileLinkStatusResponse>;
                edit: (params_0: {
                    uuid: string;
                    fileUUID: string;
                    expiration?: import("./api/v3/file/link/edit").FileLinkEditExpiration | undefined;
                    password?: string | undefined;
                    downloadBtn?: boolean | undefined;
                    type: "enable" | "disable" | "edit";
                }) => Promise<void>;
                info: (params_0: {
                    uuid: string;
                    password: string;
                }) => Promise<import("./api/v3/file/link/info").FileLinkInfoResponse>;
                password: (params_0: {
                    uuid: string;
                }) => Promise<import("./api/v3/file/link/password").FileLinkPasswordResponse>;
            };
            versions: (params_0: {
                uuid: string;
            }) => Promise<import("./api/v3/file/versions").FileVersionsResponse>;
        };
        trash: () => {
            empty: () => Promise<void>;
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
    fs(): FS;
    readonly utils: {
        sleep: typeof import("./utils").sleep;
        convertTimestampToMs: typeof import("./utils").convertTimestampToMs;
        normalizePath: typeof import("./utils").normalizePath;
        uuidv4: typeof import("./utils").uuidv4;
        Uint8ArrayConcat: typeof import("./utils").Uint8ArrayConcat;
    };
}
export default FilenSDK;
