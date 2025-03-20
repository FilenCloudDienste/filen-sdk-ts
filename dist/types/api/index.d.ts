import type FilenSDK from "..";
/**
 * API
 * @date 2/1/2024 - 4:46:43 PM
 *
 * @export
 * @class API
 * @typedef {API}
 */
export declare class API {
    private readonly sdk;
    private readonly apiClient;
    private readonly _v3;
    constructor(sdk: FilenSDK);
    v3(): {
        health: () => Promise<"OK">;
        dir: () => {
            content: (params_0: {
                uuid: string | "recents";
                dirsOnly?: boolean;
            }) => Promise<import("./v3/dir/content").DirContentResponse>;
            download: (params_0: {
                uuid: string;
                type?: import("./v3/dir/download").DirDownloadType;
                linkUUID?: string;
                linkHasPassword?: boolean;
                linkPassword?: string;
                linkSalt?: string;
                skipCache?: boolean;
            }) => Promise<import("./v3/dir/download").DirDownloadResponse>;
            shared: (params_0: {
                uuid: string;
            }) => Promise<import("./v3/dir/shared").DirSharedResponse>;
            linked: (params_0: {
                uuid: string;
            }) => Promise<import("./v3/dir/linked").DirLinkedResponse>;
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
                }) => Promise<import("./v3/dir/link/status").DirLinkStatusResponse>;
                remove: (params_0: {
                    uuid: string;
                }) => Promise<void>;
                edit: (params_0: {
                    uuid: string;
                    expiration: import("..").PublicLinkExpiration;
                    password: string;
                    downloadBtn: boolean;
                    passwordHashed: string;
                    salt: string;
                }) => Promise<void>;
                info: (params_0: {
                    uuid: string;
                }) => Promise<import("./v3/dir/link/info").DirLinkInfoResponse>;
                content: (params_0: {
                    uuid: string;
                    password: string;
                    parent: string;
                }) => Promise<import("./v3/dir/link/content").DirLinkContentResponse>;
            };
            exists: (params_0: {
                nameHashed: string;
                parent: string;
            }) => Promise<import("./v3/dir/exists").DirExistsResponse>;
            create: (params_0: {
                uuid?: string;
                metadataEncrypted: string;
                parent: string;
                nameHashed: string;
            }) => Promise<import("./v3/dir/create").DirCreateResponse>;
            present: (params_0: {
                uuid: string;
            }) => Promise<import("./v3/dir/present").DirPresentResponse>;
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
            metadata: (params_0: {
                uuid: string;
                metadataEncrypted: string;
                nameHashed: string;
            }) => Promise<void>;
            size: (params_0: {
                uuid: string;
                sharerId?: number;
                receiverId?: number;
                trash?: boolean;
            }) => Promise<import("./v3/dir/size").DirSizeResponse>;
            sizeLink: (params_0: {
                uuid: string;
                linkUUID: string;
            }) => Promise<import("./v3/dir/sizeLink").DirSizeLinkResponse>;
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
                color: import("./v3/dir/color").DirColors;
            }) => Promise<void>;
            tree: (params_0: {
                uuid: string;
                deviceId: string;
                skipCache?: boolean;
                includeRaw?: boolean;
            }) => Promise<import("./v3/dir/tree").DirTreeResponse>;
            get: (params_0: {
                uuid: string;
            }) => Promise<import("./v3/dir/get").DirGetResponse>;
        };
        auth: () => {
            info: (params_0: {
                email: string;
            }) => Promise<import("./v3/auth/info").AuthInfoResponse>;
        };
        login: (params_0: {
            email: string;
            password: string;
            twoFactorCode?: string;
            authVersion: import("..").AuthVersion;
        }) => Promise<import("./v3/login").LoginResponse>;
        register: (params_0: {
            email: string;
            password: string;
            salt: string;
            authVersion: import("..").AuthVersion;
            refId?: string;
            affId?: string;
        }) => Promise<void>;
        confirmationSend: (params_0: {
            email: string;
        }) => Promise<void>;
        user: () => {
            info: (params_0: {
                apiKey?: string;
            }) => Promise<import("./v3/user/info").UserInfoResponse>;
            baseFolder: (params_0: {
                apiKey?: string;
            }) => Promise<import("./v3/user/baseFolder").UserBaseFolderResponse>;
            publicKey: (params_0: {
                email: string;
            }) => Promise<import("./v3/user/publicKey").UserPublicKeyResponse>;
            settings: () => Promise<import("./v3/user/settings").UserSettingsResponse>;
            account: () => Promise<import("./v3/user/account").UserAccountResponse>;
            gdpr: () => Promise<import("./v3/user/gdpr").UserGDPRResponse>;
            avatar: (params_0: {
                base64: string;
                hash: string;
            }) => Promise<void>;
            settingsEmail: () => {
                change: (params_0: {
                    email: string;
                    password: string;
                    authVersion: import("..").AuthVersion;
                }) => Promise<void>;
            };
            personal: () => {
                change: (params_0: {
                    city: string;
                    companyName: string;
                    country: string;
                    firstName: string;
                    lastName: string;
                    postalCode: string;
                    street: string;
                    streetNumber: string;
                    vatId: string;
                }) => Promise<void>;
            };
            delete: (params_0: {
                twoFactorCode?: string;
            }) => Promise<void>;
            deleteVersions: () => Promise<void>;
            deleteAll: () => Promise<void>;
            settingsPassword: () => {
                change: (params_0: {
                    password: string;
                    currentPassword: string;
                    authVersion: import("..").AuthVersion;
                    salt: string;
                    masterKeys: string;
                }) => Promise<import("./v3/user/settings/password/change").UserSettingsPasswordChangeResponse>;
            };
            twoFactorAuthentication: () => {
                enable: (params_0: {
                    code: string;
                }) => Promise<import("./v3/user/2fa/enable").User2FAEnableResponse>;
                disable: (params_0: {
                    code: string;
                }) => Promise<void>;
            };
            events: (params_0: {
                lastTimestamp: number;
                filter: string;
            }) => Promise<import("./v3/user/events").UserEvent[]>;
            event: (params_0: {
                uuid: string;
            }) => Promise<import("./v3/user/events").UserEvent>;
            sub: () => {
                cancel: (params_0: {
                    uuid: string;
                }) => Promise<void>;
                create: (params_0: {
                    planId: number;
                    method: import("./v3/user/sub/create").PaymentMethods;
                }) => Promise<import("./v3/user/sub/create").UserSubCreateResponse>;
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
            }) => Promise<import("./v3/user/profile").UserProfileResponse>;
            lastActive: () => {
                desktop: (params_0: {
                    timestamp: number;
                }) => Promise<void>;
            };
            keyPair: () => {
                update: (params_0: {
                    publicKey: string;
                    encryptedPrivateKey: string;
                    apiKey?: string;
                }) => Promise<void>;
                set: (params_0: {
                    publicKey: string;
                    encryptedPrivateKey: string;
                    apiKey?: string;
                }) => Promise<void>;
                info: (params_0: {
                    apiKey?: string;
                }) => Promise<import("./v3/user/keyPair/info").UserKeyPairInfoResponse>;
            };
            masterKeys: (params_0: {
                encryptedMasterKeys: string;
                apiKey?: string;
            }) => Promise<import("./v3/user/masterKeys").UserMasterKeysResponse>;
            setDEK: (params_0: {
                encryptedDEK: string;
                apiKey?: string;
            }) => Promise<void>;
            getDEK: (params?: {
                apiKey?: string;
            } | undefined) => Promise<import("./v3/user/getDEK").UserGetDEKResponse>;
            password: () => {
                forgot: (params_0: {
                    email: string;
                }) => Promise<void>;
                forgotReset: (params_0: {
                    token: string;
                    password: string;
                    authVersion: number;
                    salt: string;
                    hasRecoveryKeys: boolean;
                    newMasterKeys: string;
                }) => Promise<void>;
            };
            didExportMasterKeys: () => Promise<void>;
            lock: (params_0: {
                uuid: string;
                resource: string;
                type: "acquire" | "refresh" | "status" | "release";
            }) => Promise<import("./v3/user/lock").UserLockResponse>;
        };
        shared: () => {
            in: (params?: {
                uuid?: string;
            } | undefined) => Promise<import("./v3/shared/in").SharedInResponse>;
            out: (params?: {
                uuid?: string;
                receiverId?: number;
            } | undefined) => Promise<import("./v3/shared/out").SharedOutResponse>;
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
                version: import("..").FileEncryptionVersion;
                uploadKey: string;
            }) => Promise<import("./v3/upload/done").UploadDoneResponse>;
            empty: (params_0: {
                uuid: string;
                name: string;
                nameHashed: string;
                size: string;
                parent: string;
                mime: string;
                metadata: string;
                version: import("..").FileEncryptionVersion;
            }) => Promise<import("./v3/upload/empty").UploadEmptyResponse>;
        };
        item: () => {
            share: (params_0: {
                uuid: string;
                parent: string;
                email: string;
                type: "file" | "folder";
                metadata: string;
            }) => Promise<void>;
            shared: (params_0: {
                uuid: string;
            }) => Promise<import("./v3/item/shared").ItemSharedResponse>;
            linked: (params_0: {
                uuid: string;
            }) => Promise<import("./v3/item/linked").ItemLinkedResponse>;
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
                nameHashed: string;
                parent: string;
            }) => Promise<import("./v3/file/exists").FileExistsResponse>;
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
            metadata: (params_0: {
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
                }) => Promise<import("./v3/file/link/status").FileLinkStatusResponse>;
                edit: (params_0: {
                    uuid: string;
                    fileUUID: string;
                    expiration: import("..").PublicLinkExpiration;
                    password: string;
                    passwordHashed: string;
                    downloadBtn: boolean;
                    type: "enable" | "disable";
                    salt: string;
                }) => Promise<void>;
                info: (params_0: {
                    uuid: string;
                    password: string;
                }) => Promise<import("./v3/file/link/info").FileLinkInfoResponse>;
                password: (params_0: {
                    uuid: string;
                }) => Promise<import("./v3/file/link/password").FileLinkPasswordResponse>;
            };
            versions: (params_0: {
                uuid: string;
            }) => Promise<import("./v3/file/versions").FileVersionsResponse>;
            download: () => {
                chunk: () => {
                    buffer: (params_0: {
                        uuid: string;
                        bucket: string;
                        region: string;
                        chunk: number;
                        timeout?: number;
                        abortSignal?: AbortSignal;
                        onProgress?: import("..").ProgressCallback;
                        onProgressId?: string;
                    }) => Promise<Buffer>;
                    stream: (params_0: {
                        uuid: string;
                        bucket: string;
                        region: string;
                        chunk: number;
                        timeout?: number;
                        abortSignal?: AbortSignal;
                        onProgress?: import("..").ProgressCallback;
                        onProgressId?: string;
                    }) => Promise<ReadableStream<any> | import("fs").ReadStream>;
                    local: (params_0: {
                        uuid: string;
                        bucket: string;
                        region: string;
                        chunk: number;
                        timeout?: number;
                        abortSignal?: AbortSignal;
                        to: string;
                        onProgress?: import("..").ProgressCallback;
                        onProgressId?: string;
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
                        abortSignal?: AbortSignal;
                        maxRetries?: number;
                        retryTimeout?: number;
                        timeout?: number;
                        buffer: Buffer;
                        onProgress?: import("..").ProgressCallback;
                        onProgressId?: string;
                    }) => Promise<import("./client").UploadChunkResponse>;
                };
            };
            get: (params_0: {
                uuid: string;
            }) => Promise<import("./v3/file/get").FileGetResponse>;
            present: (params_0: {
                uuid: string;
            }) => Promise<import("./v3/file/present").FilePresentResponse>;
        };
        trash: () => {
            empty: () => Promise<void>;
        };
        chat: () => {
            conversations: () => Promise<import("./v3/chat/conversations").ChatConversation[]>;
            messages: (params_0: {
                conversation: string;
                timestamp: number;
            }) => Promise<import("./v3/chat/messages").ChatMessage[]>;
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
                ownerMetadata: string;
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
                type: import("./v3/chat/typing").ChatTypingType;
            }) => Promise<void>;
            conversationsRead: (params_0: {
                uuid: string;
            }) => Promise<void>;
            conversationsUnread: (params_0: {
                uuid: string;
            }) => Promise<import("./v3/chat/conversations/unread").ChatConversationsUnreadResponse>;
            unread: () => Promise<import("./v3/chat/unread").ChatUnreadResponse>;
            conversationsOnline: (params_0: {
                conversation: string;
            }) => Promise<import("./v3/chat/conversations/online").ChatConversationsOnlineResponse>;
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
                conversations: import("./v3/chat/lastFocusUpdate").ChatLastFocusValues[];
            }) => Promise<void>;
            lastFocus: () => Promise<import("./v3/chat/lastFocusUpdate").ChatLastFocusValues[]>;
        };
        notes: () => {
            all: () => Promise<import("./v3/notes").NotesResponse>;
            content: (params_0: {
                uuid: string;
            }) => Promise<import("./v3/notes/content").NoteContent>;
            create: (params_0: {
                uuid: string;
                title: string;
                metadata: string;
            }) => Promise<void>;
            contentEdit: (params_0: {
                uuid: string;
                preview: string;
                content: string;
                type: import("./v3/notes").NoteType;
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
                type: import("./v3/notes").NoteType;
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
            }) => Promise<import("./v3/notes/history").NotesHistoryResponse>;
            historyRestore: (params_0: {
                uuid: string;
                id: number;
            }) => Promise<void>;
            participantsRemove: (params_0: {
                uuid: string;
                userId: number;
            }) => Promise<void>;
            participantsAdd: (params_0: {
                uuid: string;
                contactUUID: string;
                metadata: string;
                permissionsWrite: boolean;
            }) => Promise<void>;
            participantsPermissions: (params_0: {
                uuid: string;
                userId: number;
                permissionsWrite: boolean;
            }) => Promise<void>;
            tags: () => Promise<import("./v3/notes/tags").NotesTagsResponse>;
            tagsCreate: (params_0: {
                name: string;
            }) => Promise<import("./v3/notes/tags/create").NotesTagsCreateResponse>;
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
            all: () => Promise<import("./v3/contacts").ContactsResponse>;
            requestsIn: () => Promise<import("./v3/contacts/requests/in").ContactsRequestsInResponse>;
            requestsInCount: () => Promise<number>;
            requestsOut: () => Promise<import("./v3/contacts/requests/out").ContactsRequestsOutResponse>;
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
            blocked: () => Promise<import("./v3/contacts/blocked").ContactsBlockedResponse>;
            blockedAdd: (params_0: {
                email: string;
            }) => Promise<void>;
            blockedDelete: (params_0: {
                uuid: string;
            }) => Promise<void>;
        };
        search: () => {
            add: (params_0: {
                items: import("./v3/search/add").SearchAddItem[];
            }) => Promise<import("./v3/search/add").SearchAddResponse>;
            find: (params_0: {
                hashes: string[];
            }) => Promise<import("./v3/search/find").SearchFindResponse>;
        };
    };
}
export default API;
