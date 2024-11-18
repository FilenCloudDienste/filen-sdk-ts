"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API = void 0;
const client_1 = __importDefault(require("./client"));
const health_1 = __importDefault(require("./v3/health"));
const content_1 = __importDefault(require("./v3/dir/content"));
const info_1 = __importDefault(require("./v3/auth/info"));
const login_1 = __importDefault(require("./v3/login"));
const info_2 = __importDefault(require("./v3/user/info"));
const baseFolder_1 = __importDefault(require("./v3/user/baseFolder"));
const in_1 = __importDefault(require("./v3/shared/in"));
const out_1 = __importDefault(require("./v3/shared/out"));
const done_1 = __importDefault(require("./v3/upload/done"));
const download_1 = __importDefault(require("./v3/dir/download"));
const shared_1 = __importDefault(require("./v3/dir/shared"));
const linked_1 = __importDefault(require("./v3/dir/linked"));
const add_1 = __importDefault(require("./v3/dir/link/add"));
const share_1 = __importDefault(require("./v3/item/share"));
const shared_2 = __importDefault(require("./v3/item/shared"));
const linked_2 = __importDefault(require("./v3/item/linked"));
const rename_1 = __importDefault(require("./v3/item/linked/rename"));
const rename_2 = __importDefault(require("./v3/item/shared/rename"));
const exists_1 = __importDefault(require("./v3/dir/exists"));
const exists_2 = __importDefault(require("./v3/file/exists"));
const create_1 = __importDefault(require("./v3/dir/create"));
const present_1 = __importDefault(require("./v3/dir/present"));
const trash_1 = __importDefault(require("./v3/dir/trash"));
const trash_2 = __importDefault(require("./v3/file/trash"));
const move_1 = __importDefault(require("./v3/file/move"));
const move_2 = __importDefault(require("./v3/dir/move"));
const rename_3 = __importDefault(require("./v3/file/rename"));
const rename_4 = __importDefault(require("./v3/dir/rename"));
const size_1 = __importDefault(require("./v3/dir/size"));
const sizeLink_1 = __importDefault(require("./v3/dir/sizeLink"));
const favorite_1 = __importDefault(require("./v3/item/favorite"));
const empty_1 = __importDefault(require("./v3/trash/empty"));
const permanent_1 = __importDefault(require("./v3/file/delete/permanent"));
const permanent_2 = __importDefault(require("./v3/dir/delete/permanent"));
const restore_1 = __importDefault(require("./v3/file/restore"));
const restore_2 = __importDefault(require("./v3/dir/restore"));
const restore_3 = __importDefault(require("./v3/file/version/restore"));
const publicKey_1 = __importDefault(require("./v3/user/publicKey"));
const remove_1 = __importDefault(require("./v3/item/shared/out/remove"));
const remove_2 = __importDefault(require("./v3/item/shared/in/remove"));
const status_1 = __importDefault(require("./v3/dir/link/status"));
const status_2 = __importDefault(require("./v3/file/link/status"));
const edit_1 = __importDefault(require("./v3/file/link/edit"));
const remove_3 = __importDefault(require("./v3/dir/link/remove"));
const edit_2 = __importDefault(require("./v3/dir/link/edit"));
const versions_1 = __importDefault(require("./v3/file/versions"));
const color_1 = __importDefault(require("./v3/dir/color"));
const settings_1 = __importDefault(require("./v3/user/settings"));
const account_1 = __importDefault(require("./v3/user/account"));
const gdpr_1 = __importDefault(require("./v3/user/gdpr"));
const avatar_1 = __importDefault(require("./v3/user/avatar"));
const change_1 = __importDefault(require("./v3/user/settings/email/change"));
const update_1 = __importDefault(require("./v3/user/personal/update"));
const delete_1 = __importDefault(require("./v3/user/delete"));
const versions_2 = __importDefault(require("./v3/user/delete/versions"));
const all_1 = __importDefault(require("./v3/user/delete/all"));
const change_2 = __importDefault(require("./v3/user/settings/password/change"));
const enable_1 = __importDefault(require("./v3/user/2fa/enable"));
const disable_1 = __importDefault(require("./v3/user/2fa/disable"));
const events_1 = __importDefault(require("./v3/user/events"));
const event_1 = __importDefault(require("./v3/user/event"));
const info_3 = __importDefault(require("./v3/file/link/info"));
const password_1 = __importDefault(require("./v3/file/link/password"));
const info_4 = __importDefault(require("./v3/dir/link/info"));
const content_2 = __importDefault(require("./v3/dir/link/content"));
const cancel_1 = __importDefault(require("./v3/user/sub/cancel"));
const invoice_1 = __importDefault(require("./v3/user/invoice"));
const create_2 = __importDefault(require("./v3/user/sub/create"));
const payout_1 = __importDefault(require("./v3/user/affiliate/payout"));
const versioning_1 = __importDefault(require("./v3/user/versioning"));
const loginAlerts_1 = __importDefault(require("./v3/user/loginAlerts"));
const conversations_1 = __importDefault(require("./v3/chat/conversations"));
const messages_1 = __importDefault(require("./v3/chat/messages"));
const edit_3 = __importDefault(require("./v3/chat/conversations/name/edit"));
const send_1 = __importDefault(require("./v3/chat/send"));
const edit_4 = __importDefault(require("./v3/chat/edit"));
const create_3 = __importDefault(require("./v3/chat/conversations/create"));
const add_2 = __importDefault(require("./v3/chat/conversations/participants/add"));
const typing_1 = __importDefault(require("./v3/chat/typing"));
const read_1 = __importDefault(require("./v3/chat/conversations/read"));
const unread_1 = __importDefault(require("./v3/chat/conversations/unread"));
const unread_2 = __importDefault(require("./v3/chat/unread"));
const online_1 = __importDefault(require("./v3/chat/conversations/online"));
const delete_2 = __importDefault(require("./v3/chat/delete"));
const notes_1 = __importDefault(require("./v3/notes"));
const content_3 = __importDefault(require("./v3/notes/content"));
const create_4 = __importDefault(require("./v3/notes/create"));
const edit_5 = __importDefault(require("./v3/notes/content/edit"));
const edit_6 = __importDefault(require("./v3/notes/title/edit"));
const delete_3 = __importDefault(require("./v3/notes/delete"));
const trash_3 = __importDefault(require("./v3/notes/trash"));
const archive_1 = __importDefault(require("./v3/notes/archive"));
const restore_4 = __importDefault(require("./v3/notes/restore"));
const change_3 = __importDefault(require("./v3/notes/type/change"));
const pinned_1 = __importDefault(require("./v3/notes/pinned"));
const favorite_2 = __importDefault(require("./v3/notes/favorite"));
const history_1 = __importDefault(require("./v3/notes/history"));
const restore_5 = __importDefault(require("./v3/notes/history/restore"));
const remove_4 = __importDefault(require("./v3/notes/participants/remove"));
const permissions_1 = __importDefault(require("./v3/notes/participants/permissions"));
const contacts_1 = __importDefault(require("./v3/contacts"));
const in_2 = __importDefault(require("./v3/contacts/requests/in"));
const count_1 = __importDefault(require("./v3/contacts/requests/in/count"));
const out_2 = __importDefault(require("./v3/contacts/requests/out"));
const delete_4 = __importDefault(require("./v3/contacts/requests/out/delete"));
const send_2 = __importDefault(require("./v3/contacts/requests/send"));
const accept_1 = __importDefault(require("./v3/contacts/requests/accept"));
const deny_1 = __importDefault(require("./v3/contacts/requests/deny"));
const delete_5 = __importDefault(require("./v3/contacts/delete"));
const nickname_1 = __importDefault(require("./v3/user/nickname"));
const appearOffline_1 = __importDefault(require("./v3/user/appearOffline"));
const blocked_1 = __importDefault(require("./v3/contacts/blocked"));
const add_3 = __importDefault(require("./v3/contacts/blocked/add"));
const delete_6 = __importDefault(require("./v3/contacts/blocked/delete"));
const tags_1 = __importDefault(require("./v3/notes/tags"));
const create_5 = __importDefault(require("./v3/notes/tags/create"));
const rename_5 = __importDefault(require("./v3/notes/tags/rename"));
const delete_7 = __importDefault(require("./v3/notes/tags/delete"));
const favorite_3 = __importDefault(require("./v3/notes/tags/favorite"));
const tag_1 = __importDefault(require("./v3/notes/tag"));
const untag_1 = __importDefault(require("./v3/notes/untag"));
const disable_2 = __importDefault(require("./v3/chat/message/embed/disable"));
const remove_5 = __importDefault(require("./v3/chat/conversations/participants/remove"));
const leave_1 = __importDefault(require("./v3/chat/conversations/leave"));
const delete_8 = __importDefault(require("./v3/chat/conversations/delete"));
const lastFocusUpdate_1 = __importDefault(require("./v3/chat/lastFocusUpdate"));
const lastFocus_1 = __importDefault(require("./v3/chat/lastFocus"));
const profile_1 = __importDefault(require("./v3/user/profile"));
const desktop_1 = __importDefault(require("./v3/user/lastActive/desktop"));
const buffer_1 = __importDefault(require("./v3/file/download/chunk/buffer"));
const stream_1 = __importDefault(require("./v3/file/download/chunk/stream"));
const local_1 = __importDefault(require("./v3/file/download/chunk/local"));
const buffer_2 = __importDefault(require("./v3/file/upload/chunk/buffer"));
const add_4 = __importDefault(require("./v3/notes/participants/add"));
const update_2 = __importDefault(require("./v3/user/keyPair/update"));
const set_1 = __importDefault(require("./v3/user/keyPair/set"));
const info_5 = __importDefault(require("./v3/user/keyPair/info"));
const masterKeys_1 = __importDefault(require("./v3/user/masterKeys"));
const register_1 = __importDefault(require("./v3/register"));
const confirmationSend_1 = __importDefault(require("./v3/confirmationSend"));
const forgot_1 = __importDefault(require("./v3/user/password/forgot"));
const forgotReset_1 = __importDefault(require("./v3/user/password/forgotReset"));
const didExportMasterKeys_1 = __importDefault(require("./v3/user/didExportMasterKeys"));
const tree_1 = __importDefault(require("./v3/dir/tree"));
const lock_1 = __importDefault(require("./v3/user/lock"));
const get_1 = __importDefault(require("./v3/dir/get"));
const get_2 = __importDefault(require("./v3/file/get"));
const present_2 = __importDefault(require("./v3/file/present"));
/**
 * API
 * @date 2/1/2024 - 4:46:43 PM
 *
 * @export
 * @class API
 * @typedef {API}
 */
class API {
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
        this.apiClient = new client_1.default({
            apiKey: this.config.apiKey,
            sdk: this.config.sdk
        });
        this._v3 = {
            health: new health_1.default({ apiClient: this.apiClient }),
            dir: {
                content: new content_1.default({ apiClient: this.apiClient }),
                download: new download_1.default({ apiClient: this.apiClient }),
                shared: new shared_1.default({ apiClient: this.apiClient }),
                linked: new linked_1.default({ apiClient: this.apiClient }),
                link: {
                    add: new add_1.default({ apiClient: this.apiClient }),
                    status: new status_1.default({ apiClient: this.apiClient }),
                    remove: new remove_3.default({ apiClient: this.apiClient }),
                    edit: new edit_2.default({ apiClient: this.apiClient }),
                    info: new info_4.default({ apiClient: this.apiClient }),
                    content: new content_2.default({ apiClient: this.apiClient })
                },
                exists: new exists_1.default({ apiClient: this.apiClient }),
                create: new create_1.default({ apiClient: this.apiClient }),
                present: new present_1.default({ apiClient: this.apiClient }),
                trash: new trash_1.default({ apiClient: this.apiClient }),
                move: new move_2.default({ apiClient: this.apiClient }),
                rename: new rename_4.default({ apiClient: this.apiClient }),
                size: new size_1.default({ apiClient: this.apiClient }),
                sizeLink: new sizeLink_1.default({ apiClient: this.apiClient }),
                delete: {
                    permanent: new permanent_2.default({ apiClient: this.apiClient })
                },
                restore: new restore_2.default({ apiClient: this.apiClient }),
                color: new color_1.default({ apiClient: this.apiClient }),
                tree: new tree_1.default({ apiClient: this.apiClient }),
                get: new get_1.default({ apiClient: this.apiClient })
            },
            auth: {
                info: new info_1.default({ apiClient: this.apiClient })
            },
            login: new login_1.default({ apiClient: this.apiClient }),
            register: new register_1.default({ apiClient: this.apiClient }),
            confirmationSend: new confirmationSend_1.default({ apiClient: this.apiClient }),
            user: {
                info: new info_2.default({ apiClient: this.apiClient }),
                baseFolder: new baseFolder_1.default({ apiClient: this.apiClient }),
                publicKey: new publicKey_1.default({ apiClient: this.apiClient }),
                settings: new settings_1.default({ apiClient: this.apiClient }),
                account: new account_1.default({ apiClient: this.apiClient }),
                gdpr: new gdpr_1.default({ apiClient: this.apiClient }),
                avatar: new avatar_1.default({ apiClient: this.apiClient }),
                settingsEmail: {
                    change: new change_1.default({ apiClient: this.apiClient })
                },
                personal: {
                    update: new update_1.default({ apiClient: this.apiClient })
                },
                delete: new delete_1.default({ apiClient: this.apiClient }),
                deleteVersions: new versions_2.default({ apiClient: this.apiClient }),
                deleteAll: new all_1.default({ apiClient: this.apiClient }),
                settingsPassword: {
                    change: new change_2.default({ apiClient: this.apiClient })
                },
                twoFactorAuthentication: {
                    enable: new enable_1.default({ apiClient: this.apiClient }),
                    disable: new disable_1.default({ apiClient: this.apiClient })
                },
                events: new events_1.default({ apiClient: this.apiClient }),
                event: new event_1.default({ apiClient: this.apiClient }),
                sub: {
                    cancel: new cancel_1.default({ apiClient: this.apiClient }),
                    create: new create_2.default({ apiClient: this.apiClient })
                },
                invoice: new invoice_1.default({ apiClient: this.apiClient }),
                affiliate: {
                    payout: new payout_1.default({ apiClient: this.apiClient })
                },
                versioning: new versioning_1.default({ apiClient: this.apiClient }),
                loginAlerts: new loginAlerts_1.default({ apiClient: this.apiClient }),
                nickname: new nickname_1.default({ apiClient: this.apiClient }),
                appearOffline: new appearOffline_1.default({ apiClient: this.apiClient }),
                profile: new profile_1.default({ apiClient: this.apiClient }),
                lastActive: {
                    desktop: new desktop_1.default({ apiClient: this.apiClient })
                },
                keyPair: {
                    update: new update_2.default({ apiClient: this.apiClient }),
                    set: new set_1.default({ apiClient: this.apiClient }),
                    info: new info_5.default({ apiClient: this.apiClient })
                },
                masterKeys: new masterKeys_1.default({ apiClient: this.apiClient }),
                password: {
                    forgot: new forgot_1.default({ apiClient: this.apiClient }),
                    forgotReset: new forgotReset_1.default({ apiClient: this.apiClient })
                },
                didExportMasterKeys: new didExportMasterKeys_1.default({ apiClient: this.apiClient }),
                lock: new lock_1.default({ apiClient: this.apiClient })
            },
            shared: {
                in: new in_1.default({ apiClient: this.apiClient }),
                out: new out_1.default({ apiClient: this.apiClient })
            },
            upload: {
                done: new done_1.default({ apiClient: this.apiClient })
            },
            item: {
                share: new share_1.default({ apiClient: this.apiClient }),
                shared: new shared_2.default({ apiClient: this.apiClient }),
                linked: new linked_2.default({ apiClient: this.apiClient }),
                linkedRename: new rename_1.default({ apiClient: this.apiClient }),
                sharedRename: new rename_2.default({ apiClient: this.apiClient }),
                favorite: new favorite_1.default({ apiClient: this.apiClient }),
                sharedOut: {
                    remove: new remove_1.default({ apiClient: this.apiClient })
                },
                sharedIn: {
                    remove: new remove_2.default({ apiClient: this.apiClient })
                }
            },
            file: {
                exists: new exists_2.default({ apiClient: this.apiClient }),
                trash: new trash_2.default({ apiClient: this.apiClient }),
                move: new move_1.default({ apiClient: this.apiClient }),
                rename: new rename_3.default({ apiClient: this.apiClient }),
                delete: {
                    permanent: new permanent_1.default({ apiClient: this.apiClient })
                },
                restore: new restore_1.default({ apiClient: this.apiClient }),
                version: {
                    restore: new restore_3.default({ apiClient: this.apiClient })
                },
                link: {
                    status: new status_2.default({ apiClient: this.apiClient }),
                    edit: new edit_1.default({ apiClient: this.apiClient }),
                    info: new info_3.default({ apiClient: this.apiClient }),
                    password: new password_1.default({ apiClient: this.apiClient })
                },
                versions: new versions_1.default({ apiClient: this.apiClient }),
                download: {
                    chunk: {
                        buffer: new buffer_1.default({ apiClient: this.apiClient }),
                        stream: new stream_1.default({ apiClient: this.apiClient }),
                        local: new local_1.default({ apiClient: this.apiClient })
                    }
                },
                upload: {
                    chunk: {
                        buffer: new buffer_2.default({ apiClient: this.apiClient })
                    }
                },
                get: new get_2.default({ apiClient: this.apiClient }),
                present: new present_2.default({ apiClient: this.apiClient })
            },
            trash: {
                empty: new empty_1.default({ apiClient: this.apiClient })
            },
            chat: {
                conversations: new conversations_1.default({ apiClient: this.apiClient }),
                messages: new messages_1.default({ apiClient: this.apiClient }),
                conversationsName: {
                    edit: new edit_3.default({ apiClient: this.apiClient })
                },
                send: new send_1.default({ apiClient: this.apiClient }),
                edit: new edit_4.default({ apiClient: this.apiClient }),
                conversationsCreate: new create_3.default({ apiClient: this.apiClient }),
                conversationsParticipants: {
                    add: new add_2.default({ apiClient: this.apiClient }),
                    remove: new remove_5.default({ apiClient: this.apiClient })
                },
                typing: new typing_1.default({ apiClient: this.apiClient }),
                conversationsRead: new read_1.default({ apiClient: this.apiClient }),
                conversationsUnread: new unread_1.default({ apiClient: this.apiClient }),
                unread: new unread_2.default({ apiClient: this.apiClient }),
                conversationsOnline: new online_1.default({ apiClient: this.apiClient }),
                delete: new delete_2.default({ apiClient: this.apiClient }),
                message: {
                    embed: {
                        disable: new disable_2.default({ apiClient: this.apiClient })
                    }
                },
                conversationsLeave: new leave_1.default({ apiClient: this.apiClient }),
                conversationsDelete: new delete_8.default({ apiClient: this.apiClient }),
                lastFocusUpdate: new lastFocusUpdate_1.default({ apiClient: this.apiClient }),
                lastFocus: new lastFocus_1.default({ apiClient: this.apiClient })
            },
            notes: {
                all: new notes_1.default({ apiClient: this.apiClient }),
                content: new content_3.default({ apiClient: this.apiClient }),
                create: new create_4.default({ apiClient: this.apiClient }),
                contentEdit: new edit_5.default({ apiClient: this.apiClient }),
                titleEdit: new edit_6.default({ apiClient: this.apiClient }),
                delete: new delete_3.default({ apiClient: this.apiClient }),
                trash: new trash_3.default({ apiClient: this.apiClient }),
                archive: new archive_1.default({ apiClient: this.apiClient }),
                restore: new restore_4.default({ apiClient: this.apiClient }),
                typeChange: new change_3.default({ apiClient: this.apiClient }),
                pinned: new pinned_1.default({ apiClient: this.apiClient }),
                favorite: new favorite_2.default({ apiClient: this.apiClient }),
                history: new history_1.default({ apiClient: this.apiClient }),
                historyRestore: new restore_5.default({ apiClient: this.apiClient }),
                participantsRemove: new remove_4.default({ apiClient: this.apiClient }),
                participantsPermissions: new permissions_1.default({ apiClient: this.apiClient }),
                participantsAdd: new add_4.default({ apiClient: this.apiClient }),
                tags: new tags_1.default({ apiClient: this.apiClient }),
                tagsCreate: new create_5.default({ apiClient: this.apiClient }),
                tagsRename: new rename_5.default({ apiClient: this.apiClient }),
                tagsDelete: new delete_7.default({ apiClient: this.apiClient }),
                tagsFavorite: new favorite_3.default({ apiClient: this.apiClient }),
                tag: new tag_1.default({ apiClient: this.apiClient }),
                untag: new untag_1.default({ apiClient: this.apiClient })
            },
            contacts: {
                all: new contacts_1.default({ apiClient: this.apiClient }),
                requestsIn: new in_2.default({ apiClient: this.apiClient }),
                requestsInCount: new count_1.default({ apiClient: this.apiClient }),
                requestsOut: new out_2.default({ apiClient: this.apiClient }),
                requestsOutDelete: new delete_4.default({ apiClient: this.apiClient }),
                requestsSend: new send_2.default({ apiClient: this.apiClient }),
                requestsAccept: new accept_1.default({ apiClient: this.apiClient }),
                requestsDeny: new deny_1.default({ apiClient: this.apiClient }),
                delete: new delete_5.default({ apiClient: this.apiClient }),
                blocked: new blocked_1.default({ apiClient: this.apiClient }),
                blockedAdd: new add_3.default({ apiClient: this.apiClient }),
                blockedDelete: new delete_6.default({ apiClient: this.apiClient })
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
exports.API = API;
exports.default = API;
//# sourceMappingURL=index.js.map