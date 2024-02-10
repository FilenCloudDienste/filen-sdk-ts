import APIClient from "./client"
import type Crypto from "../crypto"
import V3Health from "./v3/health"
import V3DirContent from "./v3/dir/content"
import V3AuthInfo from "./v3/auth/info"
import V3Login from "./v3/login"
import V3UserInfo from "./v3/user/info"
import V3UserBaseFolder from "./v3/user/baseFolder"
import V3SharedIn from "./v3/shared/in"
import V3SharedOut from "./v3/shared/out"
import V3UploadDone from "./v3/upload/done"
import V3DirDownload from "./v3/dir/download"
import V3DirShared from "./v3/dir/shared"
import V3DirLinked from "./v3/dir/linked"
import V3DirLinkAdd from "./v3/dir/link/add"
import V3ItemShare from "./v3/item/share"
import V3ItemShared from "./v3/item/shared"
import V3ItemLinked from "./v3/item/linked"
import V3ItemLinkedRename from "./v3/item/linked/rename"
import V3ItemSharedRename from "./v3/item/shared/rename"
import V3DirExists from "./v3/dir/exists"
import V3FileExists from "./v3/file/exists"
import V3DirCreate from "./v3/dir/create"
import V3DirPresent from "./v3/dir/present"
import V3DirTrash from "./v3/dir/trash"
import V3FileTrash from "./v3/file/trash"
import V3FileMove from "./v3/file/move"
import V3DirMove from "./v3/dir/move"
import V3FileRename from "./v3/file/rename"
import V3DirRename from "./v3/dir/rename"
import V3DirSize from "./v3/dir/size"
import V3DirSizeLink from "./v3/dir/sizeLink"
import V3ItemFavorite from "./v3/item/favorite"
import V3TrashEmpty from "./v3/trash/empty"
import V3FileDeletePermanent from "./v3/file/delete/permanent"
import V3DirDeletePermanent from "./v3/dir/delete/permanent"
import V3FileRestore from "./v3/file/restore"
import V3DirRestore from "./v3/dir/restore"
import V3FileVersionRestore from "./v3/file/version/restore"
import V3UserPublicKey from "./v3/user/publicKey"
import V3ItemSharedOutRemove from "./v3/item/shared/out/remove"
import V3ItemSharedInRemove from "./v3/item/shared/in/remove"
import V3DirLinkStatus from "./v3/dir/link/status"
import V3FileLinkStatus from "./v3/file/link/status"
import V3FileLinkEdit from "./v3/file/link/edit"
import V3DirLinkRemove from "./v3/dir/link/remove"
import V3DirLinkEdit from "./v3/dir/link/edit"
import V3FileVersions from "./v3/file/versions"
import V3DirColor from "./v3/dir/color"
import V3UserSettings from "./v3/user/settings"
import V3UserAccount from "./v3/user/account"
import V3UserGDPR from "./v3/user/gdpr"
import V3UserAvatar from "./v3/user/avatar"
import V3UserSettingsEmailChange from "./v3/user/settings/email/change"
import V3UserPersonalUpdate from "./v3/user/personal/update"
import V3UserDelete from "./v3/user/delete"
import V3UserDeleteVersions from "./v3/user/delete/versions"
import V3UserDeleteAll from "./v3/user/delete/all"
import V3UserSettingsPasswordChange from "./v3/user/settings/password/change"
import V3User2FAEnable from "./v3/user/2fa/enable"
import V3User2FADisable from "./v3/user/2fa/disable"
import V3UserEvents from "./v3/user/events"
import V3UserEvent from "./v3/user/event"
import V3FileLinkInfo from "./v3/file/link/info"
import V3FileLinkPassword from "./v3/file/link/password"
import V3DirLinkInfo from "./v3/dir/link/info"
import V3DirLinkContent from "./v3/dir/link/content"
import V3UserSubCancel from "./v3/user/sub/cancel"
import V3UserInvoice from "./v3/user/invoice"
import V3UserSubCreate from "./v3/user/sub/create"
import V3UserAffiliatePayout from "./v3/user/affiliate/payout"
import V3UserVersioning from "./v3/user/versioning"
import V3UserLoginAlerts from "./v3/user/loginAlerts"

export type APIConfig = {
	apiKey: string
	crypto: Crypto
}

/**
 * API
 * @date 2/1/2024 - 4:46:43 PM
 *
 * @export
 * @class API
 * @typedef {API}
 */
export class API {
	private readonly config: APIConfig
	private readonly apiClient: APIClient
	private readonly crypto: Crypto

	private readonly _v3: {
		health: V3Health
		dir: {
			content: V3DirContent
			download: V3DirDownload
			shared: V3DirShared
			linked: V3DirLinked
			link: {
				add: V3DirLinkAdd
				status: V3DirLinkStatus
				remove: V3DirLinkRemove
				edit: V3DirLinkEdit
				info: V3DirLinkInfo
				content: V3DirLinkContent
			}
			exists: V3DirExists
			create: V3DirCreate
			present: V3DirPresent
			trash: V3DirTrash
			move: V3DirMove
			rename: V3DirRename
			size: V3DirSize
			sizeLink: V3DirSizeLink
			delete: {
				permanent: V3DirDeletePermanent
			}
			restore: V3DirRestore
			color: V3DirColor
		}
		auth: {
			info: V3AuthInfo
		}
		login: V3Login
		user: {
			info: V3UserInfo
			baseFolder: V3UserBaseFolder
			publicKey: V3UserPublicKey
			settings: V3UserSettings
			account: V3UserAccount
			gdpr: V3UserGDPR
			avatar: V3UserAvatar
			settingsEmail: {
				change: V3UserSettingsEmailChange
			}
			personal: {
				update: V3UserPersonalUpdate
			}
			delete: V3UserDelete
			deleteVersions: V3UserDeleteVersions
			deleteAll: V3UserDeleteAll
			settingsPassword: {
				change: V3UserSettingsPasswordChange
			}
			twoFactorAuthentication: {
				enable: V3User2FAEnable
				disable: V3User2FADisable
			}
			events: V3UserEvents
			event: V3UserEvent
			sub: {
				cancel: V3UserSubCancel
				create: V3UserSubCreate
			}
			invoice: V3UserInvoice
			affiliate: {
				payout: V3UserAffiliatePayout
			}
			versioning: V3UserVersioning
			loginAlerts: V3UserLoginAlerts
		}
		shared: {
			in: V3SharedIn
			out: V3SharedOut
		}
		upload: {
			done: V3UploadDone
		}
		item: {
			share: V3ItemShare
			shared: V3ItemShared
			linked: V3ItemLinked
			linkedRename: V3ItemLinkedRename
			sharedRename: V3ItemSharedRename
			favorite: V3ItemFavorite
			sharedOut: {
				remove: V3ItemSharedOutRemove
			}
			sharedIn: {
				remove: V3ItemSharedInRemove
			}
		}
		file: {
			exists: V3FileExists
			trash: V3FileTrash
			move: V3FileMove
			rename: V3FileRename
			delete: {
				permanent: V3FileDeletePermanent
			}
			restore: V3FileRestore
			version: {
				restore: V3FileVersionRestore
			}
			link: {
				status: V3FileLinkStatus
				edit: V3FileLinkEdit
				info: V3FileLinkInfo
				password: V3FileLinkPassword
			}
			versions: V3FileVersions
		}
		trash: {
			empty: V3TrashEmpty
		}
	}

	/**
	 * Creates an instance of API.
	 * @date 2/1/2024 - 4:46:38 PM
	 *
	 * @constructor
	 * @public
	 * @param {APIConfig} params
	 */
	public constructor(params: APIConfig) {
		this.config = params

		if (this.config.apiKey.length === 0) {
			throw new Error("Invalid apiKey")
		}

		this.apiClient = new APIClient({ apiKey: this.config.apiKey })
		this.crypto = params.crypto

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
				create: new V3DirCreate({ apiClient: this.apiClient, crypto: this.crypto }),
				present: new V3DirPresent({ apiClient: this.apiClient }),
				trash: new V3DirTrash({ apiClient: this.apiClient }),
				move: new V3DirMove({ apiClient: this.apiClient }),
				rename: new V3DirRename({ apiClient: this.apiClient, crypto: this.crypto }),
				size: new V3DirSize({ apiClient: this.apiClient }),
				sizeLink: new V3DirSizeLink({ apiClient: this.apiClient }),
				delete: {
					permanent: new V3DirDeletePermanent({ apiClient: this.apiClient })
				},
				restore: new V3DirRestore({ apiClient: this.apiClient }),
				color: new V3DirColor({ apiClient: this.apiClient })
			},
			auth: {
				info: new V3AuthInfo({ apiClient: this.apiClient })
			},
			login: new V3Login({ apiClient: this.apiClient }),
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
				loginAlerts: new V3UserLoginAlerts({ apiClient: this.apiClient })
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
				rename: new V3FileRename({ apiClient: this.apiClient, crypto: this.crypto }),
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
				versions: new V3FileVersions({ apiClient: this.apiClient })
			},
			trash: {
				empty: new V3TrashEmpty({ apiClient: this.apiClient })
			}
		}
	}

	public v3() {
		return {
			health: () => this._v3.health.fetch(),
			dir: () => {
				return {
					content: (...params: Parameters<typeof this._v3.dir.content.fetch>) => this._v3.dir.content.fetch(...params),
					download: (...params: Parameters<typeof this._v3.dir.download.fetch>) => this._v3.dir.download.fetch(...params),
					shared: (...params: Parameters<typeof this._v3.dir.shared.fetch>) => this._v3.dir.shared.fetch(...params),
					linked: (...params: Parameters<typeof this._v3.dir.linked.fetch>) => this._v3.dir.linked.fetch(...params),
					link: () => {
						return {
							add: (...params: Parameters<typeof this._v3.dir.link.add.fetch>) => this._v3.dir.link.add.fetch(...params),
							status: (...params: Parameters<typeof this._v3.dir.link.status.fetch>) =>
								this._v3.dir.link.status.fetch(...params),
							remove: (...params: Parameters<typeof this._v3.dir.link.remove.fetch>) =>
								this._v3.dir.link.remove.fetch(...params),
							edit: (...params: Parameters<typeof this._v3.dir.link.edit.fetch>) => this._v3.dir.link.edit.fetch(...params),
							info: (...params: Parameters<typeof this._v3.dir.link.info.fetch>) => this._v3.dir.link.info.fetch(...params),
							content: (...params: Parameters<typeof this._v3.dir.link.content.fetch>) =>
								this._v3.dir.link.content.fetch(...params)
						}
					},
					exists: (...params: Parameters<typeof this._v3.dir.exists.fetch>) => this._v3.dir.exists.fetch(...params),
					create: (...params: Parameters<typeof this._v3.dir.create.fetch>) => this._v3.dir.create.fetch(...params),
					present: (...params: Parameters<typeof this._v3.dir.present.fetch>) => this._v3.dir.present.fetch(...params),
					trash: (...params: Parameters<typeof this._v3.dir.trash.fetch>) => this._v3.dir.trash.fetch(...params),
					move: (...params: Parameters<typeof this._v3.dir.move.fetch>) => this._v3.dir.move.fetch(...params),
					rename: (...params: Parameters<typeof this._v3.dir.rename.fetch>) => this._v3.dir.rename.fetch(...params),
					size: (...params: Parameters<typeof this._v3.dir.size.fetch>) => this._v3.dir.size.fetch(...params),
					sizeLink: (...params: Parameters<typeof this._v3.dir.sizeLink.fetch>) => this._v3.dir.sizeLink.fetch(...params),
					delete: () => {
						return {
							permanent: (...params: Parameters<typeof this._v3.dir.delete.permanent.fetch>) =>
								this._v3.dir.delete.permanent.fetch(...params)
						}
					},
					restore: (...params: Parameters<typeof this._v3.dir.restore.fetch>) => this._v3.dir.restore.fetch(...params),
					color: (...params: Parameters<typeof this._v3.dir.color.fetch>) => this._v3.dir.color.fetch(...params)
				}
			},
			auth: () => {
				return {
					info: (...params: Parameters<typeof this._v3.auth.info.fetch>) => this._v3.auth.info.fetch(...params)
				}
			},
			login: (...params: Parameters<typeof this._v3.login.fetch>) => this._v3.login.fetch(...params),
			user: () => {
				return {
					info: (...params: Parameters<typeof this._v3.user.info.fetch>) => this._v3.user.info.fetch(...params),
					baseFolder: (...params: Parameters<typeof this._v3.user.baseFolder.fetch>) => this._v3.user.baseFolder.fetch(...params),
					publicKey: (...params: Parameters<typeof this._v3.user.publicKey.fetch>) => this._v3.user.publicKey.fetch(...params),
					settings: (...params: Parameters<typeof this._v3.user.settings.fetch>) => this._v3.user.settings.fetch(...params),
					account: (...params: Parameters<typeof this._v3.user.account.fetch>) => this._v3.user.account.fetch(...params),
					gdpr: (...params: Parameters<typeof this._v3.user.gdpr.fetch>) => this._v3.user.gdpr.fetch(...params),
					avatar: (...params: Parameters<typeof this._v3.user.avatar.fetch>) => this._v3.user.avatar.fetch(...params),
					settingsEmail: () => {
						return {
							change: (...params: Parameters<typeof this._v3.user.settingsEmail.change.fetch>) =>
								this._v3.user.settingsEmail.change.fetch(...params)
						}
					},
					personal: () => {
						return {
							change: (...params: Parameters<typeof this._v3.user.personal.update.fetch>) =>
								this._v3.user.personal.update.fetch(...params)
						}
					},
					delete: (...params: Parameters<typeof this._v3.user.delete.fetch>) => this._v3.user.delete.fetch(...params),
					deleteVersions: (...params: Parameters<typeof this._v3.user.deleteVersions.fetch>) =>
						this._v3.user.deleteVersions.fetch(...params),
					deleteAll: (...params: Parameters<typeof this._v3.user.deleteAll.fetch>) => this._v3.user.deleteAll.fetch(...params),
					settingsPassword: () => {
						return {
							change: (...params: Parameters<typeof this._v3.user.settingsPassword.change.fetch>) =>
								this._v3.user.settingsPassword.change.fetch(...params)
						}
					},
					twoFactorAuthentication: () => {
						return {
							enable: (...params: Parameters<typeof this._v3.user.twoFactorAuthentication.enable.fetch>) =>
								this._v3.user.twoFactorAuthentication.enable.fetch(...params),
							disable: (...params: Parameters<typeof this._v3.user.twoFactorAuthentication.disable.fetch>) =>
								this._v3.user.twoFactorAuthentication.disable.fetch(...params)
						}
					},
					events: (...params: Parameters<typeof this._v3.user.events.fetch>) => this._v3.user.events.fetch(...params),
					event: (...params: Parameters<typeof this._v3.user.event.fetch>) => this._v3.user.event.fetch(...params),
					sub: () => {
						return {
							cancel: (...params: Parameters<typeof this._v3.user.sub.cancel.fetch>) =>
								this._v3.user.sub.cancel.fetch(...params),
							create: (...params: Parameters<typeof this._v3.user.sub.create.fetch>) =>
								this._v3.user.sub.create.fetch(...params)
						}
					},
					invoice: (...params: Parameters<typeof this._v3.user.invoice.fetch>) => this._v3.user.invoice.fetch(...params),
					affiliate: () => {
						return {
							payout: (...params: Parameters<typeof this._v3.user.affiliate.payout.fetch>) =>
								this._v3.user.affiliate.payout.fetch(...params)
						}
					},
					versioning: (...params: Parameters<typeof this._v3.user.versioning.fetch>) => this._v3.user.versioning.fetch(...params),
					loginAlerts: (...params: Parameters<typeof this._v3.user.loginAlerts.fetch>) =>
						this._v3.user.loginAlerts.fetch(...params)
				}
			},
			shared: () => {
				return {
					in: (...params: Parameters<typeof this._v3.shared.in.fetch>) => this._v3.shared.in.fetch(...params),
					out: (...params: Parameters<typeof this._v3.shared.out.fetch>) => this._v3.shared.out.fetch(...params)
				}
			},
			upload: () => {
				return {
					done: (...params: Parameters<typeof this._v3.upload.done.fetch>) => this._v3.upload.done.fetch(...params)
				}
			},
			item: () => {
				return {
					share: (...params: Parameters<typeof this._v3.item.share.fetch>) => this._v3.item.share.fetch(...params),
					shared: (...params: Parameters<typeof this._v3.item.shared.fetch>) => this._v3.item.shared.fetch(...params),
					linked: (...params: Parameters<typeof this._v3.item.linked.fetch>) => this._v3.item.linked.fetch(...params),
					linkedRename: (...params: Parameters<typeof this._v3.item.linkedRename.fetch>) =>
						this._v3.item.linkedRename.fetch(...params),
					sharedRename: (...params: Parameters<typeof this._v3.item.sharedRename.fetch>) =>
						this._v3.item.sharedRename.fetch(...params),
					favorite: (...params: Parameters<typeof this._v3.item.favorite.fetch>) => this._v3.item.favorite.fetch(...params),
					sharedOut: () => {
						return {
							remove: (...params: Parameters<typeof this._v3.item.sharedOut.remove.fetch>) =>
								this._v3.item.sharedOut.remove.fetch(...params)
						}
					},
					sharedIn: () => {
						return {
							remove: (...params: Parameters<typeof this._v3.item.sharedIn.remove.fetch>) =>
								this._v3.item.sharedIn.remove.fetch(...params)
						}
					}
				}
			},
			file: () => {
				return {
					exists: (...params: Parameters<typeof this._v3.file.exists.fetch>) => this._v3.file.exists.fetch(...params),
					trash: (...params: Parameters<typeof this._v3.file.trash.fetch>) => this._v3.file.trash.fetch(...params),
					move: (...params: Parameters<typeof this._v3.file.move.fetch>) => this._v3.file.move.fetch(...params),
					rename: (...params: Parameters<typeof this._v3.file.rename.fetch>) => this._v3.file.rename.fetch(...params),
					delete: () => {
						return {
							permanent: (...params: Parameters<typeof this._v3.file.delete.permanent.fetch>) =>
								this._v3.file.delete.permanent.fetch(...params)
						}
					},
					restore: (...params: Parameters<typeof this._v3.file.restore.fetch>) => this._v3.file.restore.fetch(...params),
					version: () => {
						return {
							restore: (...params: Parameters<typeof this._v3.file.version.restore.fetch>) =>
								this._v3.file.version.restore.fetch(...params)
						}
					},
					link: () => {
						return {
							status: (...params: Parameters<typeof this._v3.file.link.status.fetch>) =>
								this._v3.file.link.status.fetch(...params),
							edit: (...params: Parameters<typeof this._v3.file.link.edit.fetch>) => this._v3.file.link.edit.fetch(...params),
							info: (...params: Parameters<typeof this._v3.file.link.info.fetch>) => this._v3.file.link.info.fetch(...params),
							password: (...params: Parameters<typeof this._v3.file.link.password.fetch>) =>
								this._v3.file.link.password.fetch(...params)
						}
					},
					versions: (...params: Parameters<typeof this._v3.file.versions.fetch>) => this._v3.file.versions.fetch(...params)
				}
			},
			trash: () => {
				return {
					empty: (...params: Parameters<typeof this._v3.trash.empty.fetch>) => this._v3.trash.empty.fetch(...params)
				}
			}
		}
	}
}

export default API
