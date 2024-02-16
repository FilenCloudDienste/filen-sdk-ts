/// <reference types="node" />
/// <reference types="node" />
import "./reactNative";
import type { AuthVersion } from "./types";
import Crypto from "./crypto";
import FS from "./fs";
import appendStream from "./streams/append";
import { streamDecodeBase64, streamEncodeBase64 } from "./streams/base64";
import Cloud from "./cloud";
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
                metadataEncrypted: string;
                parent: string;
                nameHashed: string;
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
                metadataEncrypted: string;
                nameHashed: string;
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
            nickname: (params_0: {
                nickname: string;
            }) => Promise<void>;
            appearOffline: (params_0: {
                appearOffline: boolean;
            }) => Promise<void>;
            profile: (params_0: {
                id: number;
            }) => Promise<import("./api/v3/user/profile").UserProfileResponse>;
            lastActive: () => {
                desktop: (params_0: {
                    timestamp: number;
                }) => Promise<void>;
            };
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
                metadataEncrypted: string;
                nameEncrypted: string;
                nameHashed: string;
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
            download: () => {
                chunk: () => {
                    buffer: (params_0: {
                        uuid: string;
                        bucket: string;
                        region: string;
                        chunk: number;
                        timeout?: number | undefined;
                        abortSignal?: AbortSignal | undefined;
                    }) => Promise<Buffer>;
                    stream: (params_0: {
                        uuid: string;
                        bucket: string;
                        region: string;
                        chunk: number;
                        timeout?: number | undefined;
                        abortSignal?: AbortSignal | undefined;
                    }) => Promise<ReadableStream<any> | import("fs").ReadStream>;
                    local: (params_0: {
                        uuid: string;
                        bucket: string;
                        region: string;
                        chunk: number;
                        timeout?: number | undefined;
                        abortSignal?: AbortSignal | undefined;
                        to: string;
                    }) => Promise<void>;
                };
            };
            upload: () => {
                chunk: () => {
                    buffer: (params_0: {
                        uuid: string;
                        index: number;
                        parent: string;
                        uploadKey: string;
                        abortSignal?: AbortSignal | undefined;
                        maxRetries?: number | undefined;
                        retryTimeout?: number | undefined;
                        timeout?: number | undefined;
                        buffer: Buffer;
                    }) => Promise<import("./api/client").UploadChunkResponse>;
                };
            };
        };
        trash: () => {
            empty: () => Promise<void>;
        };
        chat: () => {
            conversations: () => Promise<import("./api/v3/chat/conversations").ChatConversation[]>;
            messages: (params_0: {
                conversation: string;
                timestamp?: number | undefined;
            }) => Promise<import("./api/v3/chat/messages").ChatMessage[]>;
            conversationsName: () => {
                edit: (params_0: {
                    uuid: string;
                    name: string;
                }) => Promise<void>;
            };
            send: (params_0: {
                conversation: string;
                uuid: string;
                message: string;
                replyTo: string;
            }) => Promise<void>;
            edit: (params_0: {
                conversation: string;
                uuid: string;
                message: string;
            }) => Promise<void>;
            conversationsCreate: (params_0: {
                uuid: string;
                metadata: string;
            }) => Promise<void>;
            conversationsParticipants: () => {
                add: (params_0: {
                    uuid: string;
                    contactUUID: string;
                    metadata: string;
                }) => Promise<void>;
                remove: (params_0: {
                    uuid: string;
                    userId: number;
                }) => Promise<void>;
            };
            typing: (params_0: {
                conversation: string;
                type: import("./api/v3/chat/typing").ChatTypingType;
            }) => Promise<void>;
            conversationsRead: (params_0: {
                uuid: string;
            }) => Promise<void>;
            conversationsUnread: (params_0: {
                uuid: string;
            }) => Promise<import("./api/v3/chat/conversations/unread").ChatConversationsUnreadResponse>;
            unread: () => Promise<import("./api/v3/chat/unread").ChatUnreadResponse>;
            conversationsOnline: (params_0: {
                conversation: string;
            }) => Promise<import("./api/v3/chat/conversations/online").ChatConversationsOnlineResponse>;
            delete: (params_0: {
                uuid: string;
            }) => Promise<void>;
            message: () => {
                embed: () => {
                    disable: (params_0: {
                        uuid: string;
                    }) => Promise<void>;
                };
            };
            conversationsLeave: (params_0: {
                uuid: string;
            }) => Promise<void>;
            conversationsDelete: (params_0: {
                uuid: string;
            }) => Promise<void>;
            lastFocusUpdate: (params_0: {
                conversations: import("./api/v3/chat/lastFocusUpdate").ChatLastFocusValues[];
            }) => Promise<void>;
            lastFocus: () => Promise<import("./api/v3/chat/lastFocus").ChatLastFocusResponse>;
        };
        notes: () => {
            all: () => Promise<import("./api/v3/notes").NotesResponse>;
            content: (params_0: {
                uuid: string;
            }) => Promise<import("./api/v3/notes/content").NoteContent>;
            create: (params_0: {
                uuid: string;
                title: string;
                metadata: string;
            }) => Promise<void>;
            contentEdit: (params_0: {
                uuid: string;
                preview: string;
                content: string;
                type: import("./api/v3/notes").NoteType;
            }) => Promise<void>;
            titleEdit: (params_0: {
                uuid: string;
                title: string;
            }) => Promise<void>;
            delete: (params_0: {
                uuid: string;
            }) => Promise<void>;
            trash: (params_0: {
                uuid: string;
            }) => Promise<void>;
            archive: (params_0: {
                uuid: string;
            }) => Promise<void>;
            restore: (params_0: {
                uuid: string;
            }) => Promise<void>;
            typeChange: (params_0: {
                uuid: string;
                type: import("./api/v3/notes").NoteType;
                preview: string;
                content: string;
            }) => Promise<void>;
            pinned: (params_0: {
                uuid: string;
                pinned: boolean;
            }) => Promise<void>;
            favorite: (params_0: {
                uuid: string;
                favorite: boolean;
            }) => Promise<void>;
            history: (params_0: {
                uuid: string;
            }) => Promise<import("./api/v3/notes/history").NotesHistoryResponse>;
            historyRestore: (params_0: {
                uuid: string;
                id: number;
            }) => Promise<void>;
            participantsRemove: (params_0: {
                uuid: string;
                userId: number;
            }) => Promise<void>;
            participantsPermissions: (params_0: {
                uuid: string;
                userId: number;
                permissionsWrite: boolean;
            }) => Promise<void>;
            tags: () => Promise<import("./api/v3/notes/tags").NotesTagsResponse>;
            tagsCreate: (params_0: {
                name: string;
            }) => Promise<import("./api/v3/notes/tags/create").NotesTagsCreateResponse>;
            tagsRename: (params_0: {
                uuid: string;
                name: string;
            }) => Promise<void>;
            tagsDelete: (params_0: {
                uuid: string;
            }) => Promise<void>;
            tagsFavorite: (params_0: {
                uuid: string;
                favorite: boolean;
            }) => Promise<void>;
            tag: (params_0: {
                uuid: string;
                tag: string;
            }) => Promise<void>;
            untag: (params_0: {
                uuid: string;
                tag: string;
            }) => Promise<void>;
        };
        contacts: () => {
            all: () => Promise<import("./api/v3/contacts").ContactsResponse>;
            requestsIn: () => Promise<import("./api/v3/contacts/requests/in").ContactsRequestsInResponse>;
            requestsInCount: () => Promise<number>;
            requestsOut: () => Promise<import("./api/v3/contacts/requests/out").ContactsRequestsOutResponse>;
            requestsOutDelete: (params_0: {
                uuid: string;
            }) => Promise<void>;
            requestsSend: (params_0: {
                email: string;
            }) => Promise<void>;
            requestsAccept: (params_0: {
                uuid: string;
            }) => Promise<void>;
            requestsDeny: (params_0: {
                uuid: string;
            }) => Promise<void>;
            delete: (params_0: {
                uuid: string;
            }) => Promise<void>;
            blocked: () => Promise<import("./api/v3/contacts/blocked").ContactsBlockedResponse>;
            blockedAdd: (params_0: {
                email: string;
            }) => Promise<void>;
            blockedDelete: (params_0: {
                uuid: string;
            }) => Promise<void>;
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
    cloud(): Cloud;
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
        convertTimestampToMs: typeof import("./utils").convertTimestampToMs;
        normalizePath: typeof import("./utils").normalizePath;
        uuidv4: typeof import("./utils").uuidv4;
        Uint8ArrayConcat: typeof import("./utils").Uint8ArrayConcat;
        promiseAllChunked: typeof import("./utils").promiseAllChunked;
        getRandomArbitrary: typeof import("./utils").getRandomArbitrary;
    };
}
export default FilenSDK;
