import APIClient from "./client";
import V3Health from "./v3/health";
import V3DirContent from "./v3/dir/content";
import V3AuthInfo from "./v3/auth/info";
import V3Login from "./v3/login";
import V3UserInfo from "./v3/user/info";
import V3UserBaseFolder from "./v3/user/baseFolder";
import V3SharedIn from "./v3/shared/in";
import V3SharedOut from "./v3/shared/out";
import V3UploadDone from "./v3/upload/done";
import V3DirDownload from "./v3/dir/download";
import V3DirShared from "./v3/dir/shared";
import V3DirLinked from "./v3/dir/linked";
import V3DirLinkAdd from "./v3/dir/link/add";
import V3ItemShare from "./v3/item/share";
import V3ItemShared from "./v3/item/shared";
import V3ItemLinked from "./v3/item/linked";
import V3ItemLinkedRename from "./v3/item/linked/rename";
import V3ItemSharedRename from "./v3/item/shared/rename";
import V3DirExists from "./v3/dir/exists";
import V3FileExists from "./v3/file/exists";
import V3DirCreate from "./v3/dir/create";
import V3DirPresent from "./v3/dir/present";
import V3DirTrash from "./v3/dir/trash";
import V3FileTrash from "./v3/file/trash";
import V3FileMove from "./v3/file/move";
import V3DirMove from "./v3/dir/move";
import V3FileRename from "./v3/file/rename";
import V3DirRename from "./v3/dir/rename";
import V3DirSize from "./v3/dir/size";
import V3DirSizeLink from "./v3/dir/sizeLink";
import V3ItemFavorite from "./v3/item/favorite";
import V3TrashEmpty from "./v3/trash/empty";
import V3FileDeletePermanent from "./v3/file/delete/permanent";
import V3DirDeletePermanent from "./v3/dir/delete/permanent";
import V3FileRestore from "./v3/file/restore";
import V3DirRestore from "./v3/dir/restore";
import V3FileVersionRestore from "./v3/file/version/restore";
import V3UserPublicKey from "./v3/user/publicKey";
import V3ItemSharedOutRemove from "./v3/item/shared/out/remove";
import V3ItemSharedInRemove from "./v3/item/shared/in/remove";
import V3DirLinkStatus from "./v3/dir/link/status";
import V3FileLinkStatus from "./v3/file/link/status";
import V3FileLinkEdit from "./v3/file/link/edit";
import V3DirLinkRemove from "./v3/dir/link/remove";
import V3DirLinkEdit from "./v3/dir/link/edit";
import V3FileVersions from "./v3/file/versions";
import V3DirColor from "./v3/dir/color";
import V3UserSettings from "./v3/user/settings";
import V3UserAccount from "./v3/user/account";
import V3UserGDPR from "./v3/user/gdpr";
import V3UserAvatar from "./v3/user/avatar";
import V3UserSettingsEmailChange from "./v3/user/settings/email/change";
import V3UserPersonalUpdate from "./v3/user/personal/update";
import V3UserDelete from "./v3/user/delete";
import V3UserDeleteVersions from "./v3/user/delete/versions";
import V3UserDeleteAll from "./v3/user/delete/all";
import V3UserSettingsPasswordChange from "./v3/user/settings/password/change";
import V3User2FAEnable from "./v3/user/2fa/enable";
import V3User2FADisable from "./v3/user/2fa/disable";
import V3UserEvents from "./v3/user/events";
import V3UserEvent from "./v3/user/event";
import V3FileLinkInfo from "./v3/file/link/info";
import V3FileLinkPassword from "./v3/file/link/password";
import V3DirLinkInfo from "./v3/dir/link/info";
import V3DirLinkContent from "./v3/dir/link/content";
import V3UserSubCancel from "./v3/user/sub/cancel";
import V3UserInvoice from "./v3/user/invoice";
import V3UserSubCreate from "./v3/user/sub/create";
import V3UserAffiliatePayout from "./v3/user/affiliate/payout";
import V3UserVersioning from "./v3/user/versioning";
import V3UserLoginAlerts from "./v3/user/loginAlerts";
import V3ChatConversations from "./v3/chat/conversations";
import V3ChatMessages from "./v3/chat/messages";
import V3ChatConversationsNameEdit from "./v3/chat/conversations/name/edit";
import V3ChatSend from "./v3/chat/send";
import V3ChatEdit from "./v3/chat/edit";
import V3ChatConversationsCreate from "./v3/chat/conversations/create";
import V3ChatConversationsParticipantAdd from "./v3/chat/conversations/participants/add";
import V3ChatTyping from "./v3/chat/typing";
import V3ChatConversationsRead from "./v3/chat/conversations/read";
import V3ChatConversationsUnread from "./v3/chat/conversations/unread";
import V3ChatUnread from "./v3/chat/unread";
import V3ChatConversationsOnline from "./v3/chat/conversations/online";
import V3ChatDelete from "./v3/chat/delete";
import V3Notes from "./v3/notes";
import V3NotesContent from "./v3/notes/content";
import V3NotesCreate from "./v3/notes/create";
import V3NotesContentEdit from "./v3/notes/content/edit";
import V3NotesTitleEdit from "./v3/notes/title/edit";
import V3NotesDelete from "./v3/notes/delete";
import V3NotesTrash from "./v3/notes/trash";
import V3NotesArchive from "./v3/notes/archive";
import V3NotesRestore from "./v3/notes/restore";
import V3NotesTypeChange from "./v3/notes/type/change";
import V3NotesPinned from "./v3/notes/pinned";
import V3NotesFavorite from "./v3/notes/favorite";
import V3NotesHistory from "./v3/notes/history";
import V3NotesHistoryRestore from "./v3/notes/history/restore";
import V3NotesParticipantsRemove from "./v3/notes/participants/remove";
import V3NotesParticipantsPermissions from "./v3/notes/participants/permissions";
import V3Contacts from "./v3/contacts";
import V3ContactsRequestsIn from "./v3/contacts/requests/in";
import V3ContactsRequestsInCount from "./v3/contacts/requests/in/count";
import V3ContactsRequestsOut from "./v3/contacts/requests/out";
import V3ContactsRequestsOutDelete from "./v3/contacts/requests/out/delete";
import V3ContactsRequestsSend from "./v3/contacts/requests/send";
import V3ContactsRequestsAccept from "./v3/contacts/requests/accept";
import V3ContactsRequestsDeny from "./v3/contacts/requests/deny";
import V3ContactsDelete from "./v3/contacts/delete";
import V3UserNickname from "./v3/user/nickname";
import V3UserAppearOffline from "./v3/user/appearOffline";
import V3ContactsBlocked from "./v3/contacts/blocked";
import V3ContactsBlockedAdd from "./v3/contacts/blocked/add";
import V3ContactsBlockedDelete from "./v3/contacts/blocked/delete";
import V3NotesTags from "./v3/notes/tags";
import V3NotesTagsCreate from "./v3/notes/tags/create";
import V3NotesTagsRename from "./v3/notes/tags/rename";
import V3NotesTagsDelete from "./v3/notes/tags/delete";
import V3NotesTagsFavorite from "./v3/notes/tags/favorite";
import V3NotesTag from "./v3/notes/tag";
import V3NotesUntag from "./v3/notes/untag";
import V3ChatMessageEmbedDisable from "./v3/chat/message/embed/disable";
import V3ChatConversationsParticipantsRemove from "./v3/chat/conversations/participants/remove";
import V3ChatConversationsLeave from "./v3/chat/conversations/leave";
import V3ChatConversationsDelete from "./v3/chat/conversations/delete";
import V3ChatLastFocusUpdate from "./v3/chat/lastFocusUpdate";
import V3ChatLastFocus from "./v3/chat/lastFocus";
import V3UserProfile from "./v3/user/profile";
import V3UserLastActiveDesktop from "./v3/user/lastActive/desktop";
import V3FileDownloadChunkBuffer from "./v3/file/download/chunk/buffer";
import V3FileDownloadChunkStream from "./v3/file/download/chunk/stream";
import V3FileDownloadChunkLocal from "./v3/file/download/chunk/local";
import V3FileUploadChunkBuffer from "./v3/file/upload/chunk/buffer";
import V3NotesParticipantsAdd from "./v3/notes/participants/add";
import V3UserKeyPairUpdate from "./v3/user/keyPair/update";
import V3UserKeyPairSet from "./v3/user/keyPair/set";
import V3UserKeyPairInfo from "./v3/user/keyPair/info";
import V3UserMasterKeys from "./v3/user/masterKeys";
import V3Register from "./v3/register";
import V3ConfirmationSend from "./v3/confirmationSend";
import V3UserPasswordForgot from "./v3/user/password/forgot";
import V3UserPasswordForgotReset from "./v3/user/password/forgotReset";
import V3UserDidExportMasterKeys from "./v3/user/didExportMasterKeys";
import V3DirTree from "./v3/dir/tree";
import V3UserLock from "./v3/user/lock";
import V3DirGet from "./v3/dir/get";
import V3FileGet from "./v3/file/get";
import V3FilePresent from "./v3/file/present";
/**
 * API
 * @date 2/1/2024 - 4:46:43 PM
 *
 * @export
 * @class API
 * @typedef {API}
 */
export class API {
    config;
    apiClient;
    _v3;
    /**
     * Creates an instance of API.
     * @date 2/1/2024 - 4:46:38 PM
     *
     * @constructor
     * @public
     * @param {APIConfig} params
     */
    constructor(params) {
        this.config = params;
        if (this.config.apiKey.length === 0) {
            throw new Error("Invalid apiKey");
        }
        this.apiClient = new APIClient({
            apiKey: this.config.apiKey,
            sdk: this.config.sdk
        });
        this._v3 = {
            health: new V3Health({ apiClient: this.apiClient }),
            dir: {
                content: new V3DirContent({ apiClient: this.apiClient }),
                download: new V3DirDownload({ apiClient: this.apiClient }),
                shared: new V3DirShared({ apiClient: this.apiClient }),
                linked: new V3DirLinked({ apiClient: this.apiClient }),
                link: {
                    add: new V3DirLinkAdd({ apiClient: this.apiClient }),
                    status: new V3DirLinkStatus({ apiClient: this.apiClient }),
                    remove: new V3DirLinkRemove({ apiClient: this.apiClient }),
                    edit: new V3DirLinkEdit({ apiClient: this.apiClient }),
                    info: new V3DirLinkInfo({ apiClient: this.apiClient }),
                    content: new V3DirLinkContent({ apiClient: this.apiClient })
                },
                exists: new V3DirExists({ apiClient: this.apiClient }),
                create: new V3DirCreate({ apiClient: this.apiClient }),
                present: new V3DirPresent({ apiClient: this.apiClient }),
                trash: new V3DirTrash({ apiClient: this.apiClient }),
                move: new V3DirMove({ apiClient: this.apiClient }),
                rename: new V3DirRename({ apiClient: this.apiClient }),
                size: new V3DirSize({ apiClient: this.apiClient }),
                sizeLink: new V3DirSizeLink({ apiClient: this.apiClient }),
                delete: {
                    permanent: new V3DirDeletePermanent({ apiClient: this.apiClient })
                },
                restore: new V3DirRestore({ apiClient: this.apiClient }),
                color: new V3DirColor({ apiClient: this.apiClient }),
                tree: new V3DirTree({ apiClient: this.apiClient }),
                get: new V3DirGet({ apiClient: this.apiClient })
            },
            auth: {
                info: new V3AuthInfo({ apiClient: this.apiClient })
            },
            login: new V3Login({ apiClient: this.apiClient }),
            register: new V3Register({ apiClient: this.apiClient }),
            confirmationSend: new V3ConfirmationSend({ apiClient: this.apiClient }),
            user: {
                info: new V3UserInfo({ apiClient: this.apiClient }),
                baseFolder: new V3UserBaseFolder({ apiClient: this.apiClient }),
                publicKey: new V3UserPublicKey({ apiClient: this.apiClient }),
                settings: new V3UserSettings({ apiClient: this.apiClient }),
                account: new V3UserAccount({ apiClient: this.apiClient }),
                gdpr: new V3UserGDPR({ apiClient: this.apiClient }),
                avatar: new V3UserAvatar({ apiClient: this.apiClient }),
                settingsEmail: {
                    change: new V3UserSettingsEmailChange({ apiClient: this.apiClient })
                },
                personal: {
                    update: new V3UserPersonalUpdate({ apiClient: this.apiClient })
                },
                delete: new V3UserDelete({ apiClient: this.apiClient }),
                deleteVersions: new V3UserDeleteVersions({ apiClient: this.apiClient }),
                deleteAll: new V3UserDeleteAll({ apiClient: this.apiClient }),
                settingsPassword: {
                    change: new V3UserSettingsPasswordChange({ apiClient: this.apiClient })
                },
                twoFactorAuthentication: {
                    enable: new V3User2FAEnable({ apiClient: this.apiClient }),
                    disable: new V3User2FADisable({ apiClient: this.apiClient })
                },
                events: new V3UserEvents({ apiClient: this.apiClient }),
                event: new V3UserEvent({ apiClient: this.apiClient }),
                sub: {
                    cancel: new V3UserSubCancel({ apiClient: this.apiClient }),
                    create: new V3UserSubCreate({ apiClient: this.apiClient })
                },
                invoice: new V3UserInvoice({ apiClient: this.apiClient }),
                affiliate: {
                    payout: new V3UserAffiliatePayout({ apiClient: this.apiClient })
                },
                versioning: new V3UserVersioning({ apiClient: this.apiClient }),
                loginAlerts: new V3UserLoginAlerts({ apiClient: this.apiClient }),
                nickname: new V3UserNickname({ apiClient: this.apiClient }),
                appearOffline: new V3UserAppearOffline({ apiClient: this.apiClient }),
                profile: new V3UserProfile({ apiClient: this.apiClient }),
                lastActive: {
                    desktop: new V3UserLastActiveDesktop({ apiClient: this.apiClient })
                },
                keyPair: {
                    update: new V3UserKeyPairUpdate({ apiClient: this.apiClient }),
                    set: new V3UserKeyPairSet({ apiClient: this.apiClient }),
                    info: new V3UserKeyPairInfo({ apiClient: this.apiClient })
                },
                masterKeys: new V3UserMasterKeys({ apiClient: this.apiClient }),
                password: {
                    forgot: new V3UserPasswordForgot({ apiClient: this.apiClient }),
                    forgotReset: new V3UserPasswordForgotReset({ apiClient: this.apiClient })
                },
                didExportMasterKeys: new V3UserDidExportMasterKeys({ apiClient: this.apiClient }),
                lock: new V3UserLock({ apiClient: this.apiClient })
            },
            shared: {
                in: new V3SharedIn({ apiClient: this.apiClient }),
                out: new V3SharedOut({ apiClient: this.apiClient })
            },
            upload: {
                done: new V3UploadDone({ apiClient: this.apiClient })
            },
            item: {
                share: new V3ItemShare({ apiClient: this.apiClient }),
                shared: new V3ItemShared({ apiClient: this.apiClient }),
                linked: new V3ItemLinked({ apiClient: this.apiClient }),
                linkedRename: new V3ItemLinkedRename({ apiClient: this.apiClient }),
                sharedRename: new V3ItemSharedRename({ apiClient: this.apiClient }),
                favorite: new V3ItemFavorite({ apiClient: this.apiClient }),
                sharedOut: {
                    remove: new V3ItemSharedOutRemove({ apiClient: this.apiClient })
                },
                sharedIn: {
                    remove: new V3ItemSharedInRemove({ apiClient: this.apiClient })
                }
            },
            file: {
                exists: new V3FileExists({ apiClient: this.apiClient }),
                trash: new V3FileTrash({ apiClient: this.apiClient }),
                move: new V3FileMove({ apiClient: this.apiClient }),
                rename: new V3FileRename({ apiClient: this.apiClient }),
                delete: {
                    permanent: new V3FileDeletePermanent({ apiClient: this.apiClient })
                },
                restore: new V3FileRestore({ apiClient: this.apiClient }),
                version: {
                    restore: new V3FileVersionRestore({ apiClient: this.apiClient })
                },
                link: {
                    status: new V3FileLinkStatus({ apiClient: this.apiClient }),
                    edit: new V3FileLinkEdit({ apiClient: this.apiClient }),
                    info: new V3FileLinkInfo({ apiClient: this.apiClient }),
                    password: new V3FileLinkPassword({ apiClient: this.apiClient })
                },
                versions: new V3FileVersions({ apiClient: this.apiClient }),
                download: {
                    chunk: {
                        buffer: new V3FileDownloadChunkBuffer({ apiClient: this.apiClient }),
                        stream: new V3FileDownloadChunkStream({ apiClient: this.apiClient }),
                        local: new V3FileDownloadChunkLocal({ apiClient: this.apiClient })
                    }
                },
                upload: {
                    chunk: {
                        buffer: new V3FileUploadChunkBuffer({ apiClient: this.apiClient })
                    }
                },
                get: new V3FileGet({ apiClient: this.apiClient }),
                present: new V3FilePresent({ apiClient: this.apiClient })
            },
            trash: {
                empty: new V3TrashEmpty({ apiClient: this.apiClient })
            },
            chat: {
                conversations: new V3ChatConversations({ apiClient: this.apiClient }),
                messages: new V3ChatMessages({ apiClient: this.apiClient }),
                conversationsName: {
                    edit: new V3ChatConversationsNameEdit({ apiClient: this.apiClient })
                },
                send: new V3ChatSend({ apiClient: this.apiClient }),
                edit: new V3ChatEdit({ apiClient: this.apiClient }),
                conversationsCreate: new V3ChatConversationsCreate({ apiClient: this.apiClient }),
                conversationsParticipants: {
                    add: new V3ChatConversationsParticipantAdd({ apiClient: this.apiClient }),
                    remove: new V3ChatConversationsParticipantsRemove({ apiClient: this.apiClient })
                },
                typing: new V3ChatTyping({ apiClient: this.apiClient }),
                conversationsRead: new V3ChatConversationsRead({ apiClient: this.apiClient }),
                conversationsUnread: new V3ChatConversationsUnread({ apiClient: this.apiClient }),
                unread: new V3ChatUnread({ apiClient: this.apiClient }),
                conversationsOnline: new V3ChatConversationsOnline({ apiClient: this.apiClient }),
                delete: new V3ChatDelete({ apiClient: this.apiClient }),
                message: {
                    embed: {
                        disable: new V3ChatMessageEmbedDisable({ apiClient: this.apiClient })
                    }
                },
                conversationsLeave: new V3ChatConversationsLeave({ apiClient: this.apiClient }),
                conversationsDelete: new V3ChatConversationsDelete({ apiClient: this.apiClient }),
                lastFocusUpdate: new V3ChatLastFocusUpdate({ apiClient: this.apiClient }),
                lastFocus: new V3ChatLastFocus({ apiClient: this.apiClient })
            },
            notes: {
                all: new V3Notes({ apiClient: this.apiClient }),
                content: new V3NotesContent({ apiClient: this.apiClient }),
                create: new V3NotesCreate({ apiClient: this.apiClient }),
                contentEdit: new V3NotesContentEdit({ apiClient: this.apiClient }),
                titleEdit: new V3NotesTitleEdit({ apiClient: this.apiClient }),
                delete: new V3NotesDelete({ apiClient: this.apiClient }),
                trash: new V3NotesTrash({ apiClient: this.apiClient }),
                archive: new V3NotesArchive({ apiClient: this.apiClient }),
                restore: new V3NotesRestore({ apiClient: this.apiClient }),
                typeChange: new V3NotesTypeChange({ apiClient: this.apiClient }),
                pinned: new V3NotesPinned({ apiClient: this.apiClient }),
                favorite: new V3NotesFavorite({ apiClient: this.apiClient }),
                history: new V3NotesHistory({ apiClient: this.apiClient }),
                historyRestore: new V3NotesHistoryRestore({ apiClient: this.apiClient }),
                participantsRemove: new V3NotesParticipantsRemove({ apiClient: this.apiClient }),
                participantsPermissions: new V3NotesParticipantsPermissions({ apiClient: this.apiClient }),
                participantsAdd: new V3NotesParticipantsAdd({ apiClient: this.apiClient }),
                tags: new V3NotesTags({ apiClient: this.apiClient }),
                tagsCreate: new V3NotesTagsCreate({ apiClient: this.apiClient }),
                tagsRename: new V3NotesTagsRename({ apiClient: this.apiClient }),
                tagsDelete: new V3NotesTagsDelete({ apiClient: this.apiClient }),
                tagsFavorite: new V3NotesTagsFavorite({ apiClient: this.apiClient }),
                tag: new V3NotesTag({ apiClient: this.apiClient }),
                untag: new V3NotesUntag({ apiClient: this.apiClient })
            },
            contacts: {
                all: new V3Contacts({ apiClient: this.apiClient }),
                requestsIn: new V3ContactsRequestsIn({ apiClient: this.apiClient }),
                requestsInCount: new V3ContactsRequestsInCount({ apiClient: this.apiClient }),
                requestsOut: new V3ContactsRequestsOut({ apiClient: this.apiClient }),
                requestsOutDelete: new V3ContactsRequestsOutDelete({ apiClient: this.apiClient }),
                requestsSend: new V3ContactsRequestsSend({ apiClient: this.apiClient }),
                requestsAccept: new V3ContactsRequestsAccept({ apiClient: this.apiClient }),
                requestsDeny: new V3ContactsRequestsDeny({ apiClient: this.apiClient }),
                delete: new V3ContactsDelete({ apiClient: this.apiClient }),
                blocked: new V3ContactsBlocked({ apiClient: this.apiClient }),
                blockedAdd: new V3ContactsBlockedAdd({ apiClient: this.apiClient }),
                blockedDelete: new V3ContactsBlockedDelete({ apiClient: this.apiClient })
            }
        };
    }
    v3() {
        return {
            health: () => this._v3.health.fetch(),
            dir: () => {
                return {
                    content: (...params) => this._v3.dir.content.fetch(...params),
                    download: (...params) => this._v3.dir.download.fetch(...params),
                    shared: (...params) => this._v3.dir.shared.fetch(...params),
                    linked: (...params) => this._v3.dir.linked.fetch(...params),
                    link: () => {
                        return {
                            add: (...params) => this._v3.dir.link.add.fetch(...params),
                            status: (...params) => this._v3.dir.link.status.fetch(...params),
                            remove: (...params) => this._v3.dir.link.remove.fetch(...params),
                            edit: (...params) => this._v3.dir.link.edit.fetch(...params),
                            info: (...params) => this._v3.dir.link.info.fetch(...params),
                            content: (...params) => this._v3.dir.link.content.fetch(...params)
                        };
                    },
                    exists: (...params) => this._v3.dir.exists.fetch(...params),
                    create: (...params) => this._v3.dir.create.fetch(...params),
                    present: (...params) => this._v3.dir.present.fetch(...params),
                    trash: (...params) => this._v3.dir.trash.fetch(...params),
                    move: (...params) => this._v3.dir.move.fetch(...params),
                    rename: (...params) => this._v3.dir.rename.fetch(...params),
                    size: (...params) => this._v3.dir.size.fetch(...params),
                    sizeLink: (...params) => this._v3.dir.sizeLink.fetch(...params),
                    delete: () => {
                        return {
                            permanent: (...params) => this._v3.dir.delete.permanent.fetch(...params)
                        };
                    },
                    restore: (...params) => this._v3.dir.restore.fetch(...params),
                    color: (...params) => this._v3.dir.color.fetch(...params),
                    tree: (...params) => this._v3.dir.tree.fetch(...params),
                    get: (...params) => this._v3.dir.get.fetch(...params)
                };
            },
            auth: () => {
                return {
                    info: (...params) => this._v3.auth.info.fetch(...params)
                };
            },
            login: (...params) => this._v3.login.fetch(...params),
            register: (...params) => this._v3.register.fetch(...params),
            confirmationSend: (...params) => this._v3.confirmationSend.fetch(...params),
            user: () => {
                return {
                    info: (...params) => this._v3.user.info.fetch(...params),
                    baseFolder: (...params) => this._v3.user.baseFolder.fetch(...params),
                    publicKey: (...params) => this._v3.user.publicKey.fetch(...params),
                    settings: (...params) => this._v3.user.settings.fetch(...params),
                    account: (...params) => this._v3.user.account.fetch(...params),
                    gdpr: (...params) => this._v3.user.gdpr.fetch(...params),
                    avatar: (...params) => this._v3.user.avatar.fetch(...params),
                    settingsEmail: () => {
                        return {
                            change: (...params) => this._v3.user.settingsEmail.change.fetch(...params)
                        };
                    },
                    personal: () => {
                        return {
                            change: (...params) => this._v3.user.personal.update.fetch(...params)
                        };
                    },
                    delete: (...params) => this._v3.user.delete.fetch(...params),
                    deleteVersions: (...params) => this._v3.user.deleteVersions.fetch(...params),
                    deleteAll: (...params) => this._v3.user.deleteAll.fetch(...params),
                    settingsPassword: () => {
                        return {
                            change: (...params) => this._v3.user.settingsPassword.change.fetch(...params)
                        };
                    },
                    twoFactorAuthentication: () => {
                        return {
                            enable: (...params) => this._v3.user.twoFactorAuthentication.enable.fetch(...params),
                            disable: (...params) => this._v3.user.twoFactorAuthentication.disable.fetch(...params)
                        };
                    },
                    events: (...params) => this._v3.user.events.fetch(...params),
                    event: (...params) => this._v3.user.event.fetch(...params),
                    sub: () => {
                        return {
                            cancel: (...params) => this._v3.user.sub.cancel.fetch(...params),
                            create: (...params) => this._v3.user.sub.create.fetch(...params)
                        };
                    },
                    invoice: (...params) => this._v3.user.invoice.fetch(...params),
                    affiliate: () => {
                        return {
                            payout: (...params) => this._v3.user.affiliate.payout.fetch(...params)
                        };
                    },
                    versioning: (...params) => this._v3.user.versioning.fetch(...params),
                    loginAlerts: (...params) => this._v3.user.loginAlerts.fetch(...params),
                    nickname: (...params) => this._v3.user.nickname.fetch(...params),
                    appearOffline: (...params) => this._v3.user.appearOffline.fetch(...params),
                    profile: (...params) => this._v3.user.profile.fetch(...params),
                    lastActive: () => {
                        return {
                            desktop: (...params) => this._v3.user.lastActive.desktop.fetch(...params)
                        };
                    },
                    keyPair: () => {
                        return {
                            update: (...params) => this._v3.user.keyPair.update.fetch(...params),
                            set: (...params) => this._v3.user.keyPair.set.fetch(...params),
                            info: (...params) => this._v3.user.keyPair.info.fetch(...params)
                        };
                    },
                    masterKeys: (...params) => this._v3.user.masterKeys.fetch(...params),
                    password: () => {
                        return {
                            forgot: (...params) => this._v3.user.password.forgot.fetch(...params),
                            forgotReset: (...params) => this._v3.user.password.forgotReset.fetch(...params)
                        };
                    },
                    didExportMasterKeys: (...params) => this._v3.user.didExportMasterKeys.fetch(...params),
                    lock: (...params) => this._v3.user.lock.fetch(...params)
                };
            },
            shared: () => {
                return {
                    in: (...params) => this._v3.shared.in.fetch(...params),
                    out: (...params) => this._v3.shared.out.fetch(...params)
                };
            },
            upload: () => {
                return {
                    done: (...params) => this._v3.upload.done.fetch(...params)
                };
            },
            item: () => {
                return {
                    share: (...params) => this._v3.item.share.fetch(...params),
                    shared: (...params) => this._v3.item.shared.fetch(...params),
                    linked: (...params) => this._v3.item.linked.fetch(...params),
                    linkedRename: (...params) => this._v3.item.linkedRename.fetch(...params),
                    sharedRename: (...params) => this._v3.item.sharedRename.fetch(...params),
                    favorite: (...params) => this._v3.item.favorite.fetch(...params),
                    sharedOut: () => {
                        return {
                            remove: (...params) => this._v3.item.sharedOut.remove.fetch(...params)
                        };
                    },
                    sharedIn: () => {
                        return {
                            remove: (...params) => this._v3.item.sharedIn.remove.fetch(...params)
                        };
                    }
                };
            },
            file: () => {
                return {
                    exists: (...params) => this._v3.file.exists.fetch(...params),
                    trash: (...params) => this._v3.file.trash.fetch(...params),
                    move: (...params) => this._v3.file.move.fetch(...params),
                    rename: (...params) => this._v3.file.rename.fetch(...params),
                    delete: () => {
                        return {
                            permanent: (...params) => this._v3.file.delete.permanent.fetch(...params)
                        };
                    },
                    restore: (...params) => this._v3.file.restore.fetch(...params),
                    version: () => {
                        return {
                            restore: (...params) => this._v3.file.version.restore.fetch(...params)
                        };
                    },
                    link: () => {
                        return {
                            status: (...params) => this._v3.file.link.status.fetch(...params),
                            edit: (...params) => this._v3.file.link.edit.fetch(...params),
                            info: (...params) => this._v3.file.link.info.fetch(...params),
                            password: (...params) => this._v3.file.link.password.fetch(...params)
                        };
                    },
                    versions: (...params) => this._v3.file.versions.fetch(...params),
                    download: () => {
                        return {
                            chunk: () => {
                                return {
                                    buffer: (...params) => this._v3.file.download.chunk.buffer.fetch(...params),
                                    stream: (...params) => this._v3.file.download.chunk.stream.fetch(...params),
                                    local: (...params) => this._v3.file.download.chunk.local.fetch(...params)
                                };
                            }
                        };
                    },
                    upload: () => {
                        return {
                            chunk: () => {
                                return {
                                    buffer: (...params) => this._v3.file.upload.chunk.buffer.fetch(...params)
                                };
                            }
                        };
                    },
                    get: (...params) => this._v3.file.get.fetch(...params),
                    present: (...params) => this._v3.file.present.fetch(...params)
                };
            },
            trash: () => {
                return {
                    empty: (...params) => this._v3.trash.empty.fetch(...params)
                };
            },
            chat: () => {
                return {
                    conversations: (...params) => this._v3.chat.conversations.fetch(...params),
                    messages: (...params) => this._v3.chat.messages.fetch(...params),
                    conversationsName: () => {
                        return {
                            edit: (...params) => this._v3.chat.conversationsName.edit.fetch(...params)
                        };
                    },
                    send: (...params) => this._v3.chat.send.fetch(...params),
                    edit: (...params) => this._v3.chat.edit.fetch(...params),
                    conversationsCreate: (...params) => this._v3.chat.conversationsCreate.fetch(...params),
                    conversationsParticipants: () => {
                        return {
                            add: (...params) => this._v3.chat.conversationsParticipants.add.fetch(...params),
                            remove: (...params) => this._v3.chat.conversationsParticipants.remove.fetch(...params)
                        };
                    },
                    typing: (...params) => this._v3.chat.typing.fetch(...params),
                    conversationsRead: (...params) => this._v3.chat.conversationsRead.fetch(...params),
                    conversationsUnread: (...params) => this._v3.chat.conversationsUnread.fetch(...params),
                    unread: (...params) => this._v3.chat.unread.fetch(...params),
                    conversationsOnline: (...params) => this._v3.chat.conversationsOnline.fetch(...params),
                    delete: (...params) => this._v3.chat.delete.fetch(...params),
                    message: () => {
                        return {
                            embed: () => {
                                return {
                                    disable: (...params) => this._v3.chat.message.embed.disable.fetch(...params)
                                };
                            }
                        };
                    },
                    conversationsLeave: (...params) => this._v3.chat.conversationsLeave.fetch(...params),
                    conversationsDelete: (...params) => this._v3.chat.conversationsDelete.fetch(...params),
                    lastFocusUpdate: (...params) => this._v3.chat.lastFocusUpdate.fetch(...params),
                    lastFocus: (...params) => this._v3.chat.lastFocus.fetch(...params)
                };
            },
            notes: () => {
                return {
                    all: (...params) => this._v3.notes.all.fetch(...params),
                    content: (...params) => this._v3.notes.content.fetch(...params),
                    create: (...params) => this._v3.notes.create.fetch(...params),
                    contentEdit: (...params) => this._v3.notes.contentEdit.fetch(...params),
                    titleEdit: (...params) => this._v3.notes.titleEdit.fetch(...params),
                    delete: (...params) => this._v3.notes.delete.fetch(...params),
                    trash: (...params) => this._v3.notes.trash.fetch(...params),
                    archive: (...params) => this._v3.notes.archive.fetch(...params),
                    restore: (...params) => this._v3.notes.restore.fetch(...params),
                    typeChange: (...params) => this._v3.notes.typeChange.fetch(...params),
                    pinned: (...params) => this._v3.notes.pinned.fetch(...params),
                    favorite: (...params) => this._v3.notes.favorite.fetch(...params),
                    history: (...params) => this._v3.notes.history.fetch(...params),
                    historyRestore: (...params) => this._v3.notes.historyRestore.fetch(...params),
                    participantsRemove: (...params) => this._v3.notes.participantsRemove.fetch(...params),
                    participantsAdd: (...params) => this._v3.notes.participantsAdd.fetch(...params),
                    participantsPermissions: (...params) => this._v3.notes.participantsPermissions.fetch(...params),
                    tags: (...params) => this._v3.notes.tags.fetch(...params),
                    tagsCreate: (...params) => this._v3.notes.tagsCreate.fetch(...params),
                    tagsRename: (...params) => this._v3.notes.tagsRename.fetch(...params),
                    tagsDelete: (...params) => this._v3.notes.tagsDelete.fetch(...params),
                    tagsFavorite: (...params) => this._v3.notes.tagsFavorite.fetch(...params),
                    tag: (...params) => this._v3.notes.tag.fetch(...params),
                    untag: (...params) => this._v3.notes.untag.fetch(...params)
                };
            },
            contacts: () => {
                return {
                    all: (...params) => this._v3.contacts.all.fetch(...params),
                    requestsIn: (...params) => this._v3.contacts.requestsIn.fetch(...params),
                    requestsInCount: (...params) => this._v3.contacts.requestsInCount.fetch(...params),
                    requestsOut: (...params) => this._v3.contacts.requestsOut.fetch(...params),
                    requestsOutDelete: (...params) => this._v3.contacts.requestsOutDelete.fetch(...params),
                    requestsSend: (...params) => this._v3.contacts.requestsSend.fetch(...params),
                    requestsAccept: (...params) => this._v3.contacts.requestsAccept.fetch(...params),
                    requestsDeny: (...params) => this._v3.contacts.requestsDeny.fetch(...params),
                    delete: (...params) => this._v3.contacts.delete.fetch(...params),
                    blocked: (...params) => this._v3.contacts.blocked.fetch(...params),
                    blockedAdd: (...params) => this._v3.contacts.blockedAdd.fetch(...params),
                    blockedDelete: (...params) => this._v3.contacts.blockedDelete.fetch(...params)
                };
            }
        };
    }
}
export default API;
//# sourceMappingURL=index.js.map