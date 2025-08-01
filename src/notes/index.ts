import type FilenSDK from ".."
import { uuidv4, simpleDate, promiseAllSettledChunked } from "../utils"
import { type NoteType, type Note, type NoteTag } from "../api/v3/notes"
import { createNotePreviewFromContentText } from "./utils"
import { MAX_NOTE_SIZE } from "../constants"
import { type NoteHistory } from "../api/v3/notes/history"
import striptags from "striptags"

/**
 * Notes
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class Notes
 * @typedef {Notes}
 */
export class Notes {
	private readonly _noteKeyCache = new Map<string, string>()
	private readonly sdk: FilenSDK

	public constructor(sdk: FilenSDK) {
		this.sdk = sdk
	}

	/**
	 * Decrypt all tags of a note.
	 * @date 2/20/2024 - 12:26:37 AM
	 *
	 * @public
	 * @async
	 * @param {{ tags: NoteTag[] }} param0
	 * @param {{}} param0.tags
	 * @returns {Promise<NoteTag[]>}
	 */
	public async allTags({ tags }: { tags: NoteTag[] }): Promise<NoteTag[]> {
		const decryptedTags: NoteTag[] = []
		const promises: Promise<void>[] = []

		for (const tag of tags) {
			promises.push(
				new Promise((resolve, reject) => {
					this.sdk
						.getWorker()
						.crypto.decrypt.noteTagName({
							name: tag.name
						})
						.then(decryptedTagName => {
							decryptedTags.push({
								...tag,
								name: decryptedTagName.length > 0 ? decryptedTagName : `CANNOT_DECRYPT_NAME_${tag.uuid}`
							})

							resolve()
						})
						.catch(reject)
				})
			)
		}

		await promiseAllSettledChunked(promises)

		return decryptedTags
	}

	/**
	 * Fetch all notes.
	 * @date 2/20/2024 - 12:26:30 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<Note[]>}
	 */
	public async all(): Promise<Note[]> {
		const allNotes = await this.sdk.api(3).notes().all()
		const notes: Note[] = []
		const promises: Promise<void>[] = []

		for (const note of allNotes) {
			promises.push(
				new Promise<void>((resolve, reject) => {
					const participantMetadata = note.participants.filter(participant => participant.userId === this.sdk.config.userId!)

					if (participantMetadata.length === 0 || !participantMetadata[0]) {
						reject(new Error("Could not find user as a participant."))

						return
					}

					const decryptKeyPromise = this._noteKeyCache.has(note.uuid)
						? Promise.resolve(this._noteKeyCache.get(note.uuid)!)
						: this.noteKey({
								uuid: note.uuid
						  })

					decryptKeyPromise
						.then(decryptedNoteKey => {
							this._noteKeyCache.set(note.uuid, decryptedNoteKey)

							this.sdk
								.getWorker()
								.crypto.decrypt.noteTitle({
									title: note.title,
									key: decryptedNoteKey
								})
								.then(decryptedNoteTitle => {
									Promise.all([
										note.preview.length === 0
											? Promise.resolve(decryptedNoteTitle)
											: this.sdk.getWorker().crypto.decrypt.notePreview({
													preview: note.preview,
													key: decryptedNoteKey
											  }),
										this.allTags({
											tags: note.tags
										})
									])
										.then(([decryptedNotePreview, decryptedNoteTags]) => {
											notes.push({
												...note,
												title: decryptedNoteTitle,
												preview: decryptedNotePreview,
												tags: decryptedNoteTags
											})

											resolve()
										})
										.catch(reject)
								})
								.catch(reject)
						})
						.catch(reject)
				})
			)
		}

		await promiseAllSettledChunked(promises)

		return notes
	}

	/**
	 * Fetch a note.
	 * @date 2/20/2024 - 2:07:16 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<Note>}
	 */
	public async get({ uuid }: { uuid: string }): Promise<Note> {
		const all = await this.all()
		const note = all.filter(note => note.uuid === uuid)

		if (note.length === 0 || !note[0]) {
			throw new Error(`Note ${uuid} not found.`)
		}

		return note[0]
	}

	/**
	 * Fetch all archived notes.
	 * @date 2/20/2024 - 12:50:24 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<Note[]>}
	 */
	public async archived(): Promise<Note[]> {
		const all = await this.all()

		return all.filter(note => note.archive)
	}

	/**
	 * Fetch all trashed notes.
	 * @date 2/20/2024 - 12:50:33 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<Note[]>}
	 */
	public async trashed(): Promise<Note[]> {
		const all = await this.all()

		return all.filter(note => note.trash)
	}

	/**
	 * Fetch all favorited notes.
	 * @date 2/20/2024 - 12:50:40 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<Note[]>}
	 */
	public async favorited(): Promise<Note[]> {
		const all = await this.all()

		return all.filter(note => note.favorite)
	}

	/**
	 * Fetch all pinned notes.
	 * @date 2/20/2024 - 12:53:55 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<Note[]>}
	 */
	public async pinned(): Promise<Note[]> {
		const all = await this.all()

		return all.filter(note => note.pinned)
	}

	/**
	 * Fetch all notes ordered by last edit timestamp.
	 * @date 2/20/2024 - 12:51:06 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<Note[]>}
	 */
	public async recents(): Promise<Note[]> {
		const all = await this.all()

		return all.sort((a, b) => b.editedTimestamp - a.editedTimestamp)
	}

	/**
	 * Get the note encryption key from owner metadata.
	 * @date 2/20/2024 - 12:26:15 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<string>}
	 */
	public async noteKey({ uuid }: { uuid: string }): Promise<string> {
		if (this._noteKeyCache.has(uuid)) {
			return this._noteKeyCache.get(uuid)!
		}

		const all = await this.sdk.api(3).notes().all()
		const note = all.filter(note => note.uuid === uuid)

		if (note.length === 0 || !note[0]) {
			throw new Error(`Could not find note ${uuid}.`)
		}

		if (note[0].ownerId === this.sdk.config.userId) {
			const decryptedNoteKey = await this.sdk.getWorker().crypto.decrypt.noteKeyOwner({
				metadata: note[0].metadata
			})

			this._noteKeyCache.set(uuid, decryptedNoteKey)

			return decryptedNoteKey
		}

		const participant = note[0].participants.filter(participant => participant.userId === this.sdk.config.userId!)

		if (participant.length === 0 || !participant[0]) {
			throw new Error(`Could not find participant metadata for note ${uuid}.`)
		}

		const decryptedNoteKey = await this.sdk.getWorker().crypto.decrypt.noteKeyParticipant({
			metadata: participant[0].metadata,
			privateKey: this.sdk.config.privateKey!
		})

		this._noteKeyCache.set(uuid, decryptedNoteKey)

		return decryptedNoteKey
	}

	/**
	 * Add a participant.
	 * @date 2/20/2024 - 1:39:20 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, contactUUID: string, permissionsWrite: boolean, publicKey: string}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.contactUUID
	 * @param {boolean} param0.permissionsWrite
	 * @param {string} param0.publicKey
	 * @returns {Promise<void>}
	 */
	public async addParticipant({
		uuid,
		contactUUID,
		permissionsWrite,
		publicKey
	}: {
		uuid: string
		contactUUID: string
		permissionsWrite: boolean
		publicKey: string
	}): Promise<void> {
		await this.sdk._locks.notesWrite.acquire()

		try {
			const decryptedNoteKey = await this.noteKey({
				uuid
			})
			const metadata = await this.sdk.getWorker().crypto.encrypt.metadataPublic({
				metadata: JSON.stringify({
					key: decryptedNoteKey
				}),
				publicKey
			})

			await this.sdk.api(3).notes().participantsAdd({
				uuid,
				metadata,
				contactUUID,
				permissionsWrite
			})
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Remove a participant.
	 * @date 2/20/2024 - 4:03:59 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, userId: number}} param0
	 * @param {string} param0.uuid
	 * @param {number} param0.userId
	 * @returns {Promise<void>}
	 */
	public async removeParticipant({ uuid, userId }: { uuid: string; userId: number }): Promise<void> {
		await this.sdk._locks.notesWrite.acquire()

		try {
			await this.sdk.api(3).notes().participantsRemove({
				uuid,
				userId
			})
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Set permissions for a participant.
	 * @date 2/20/2024 - 4:05:31 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, permissionsWrite: boolean, userId:number}} param0
	 * @param {string} param0.uuid
	 * @param {boolean} param0.permissionsWrite
	 * @param {number} param0.userId
	 * @returns {Promise<void>}
	 */
	public async participantPermissions({
		uuid,
		permissionsWrite,
		userId
	}: {
		uuid: string
		permissionsWrite: boolean
		userId: number
	}): Promise<void> {
		await this.sdk._locks.notesWrite.acquire()

		try {
			await this.sdk.api(3).notes().participantsPermissions({
				uuid,
				userId,
				permissionsWrite
			})
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Create an empty note.
	 * @date 2/19/2024 - 11:55:14 PM
	 *
	 * @public
	 * @async
	 * @param {{uuid?: string, title?: string}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.title
	 * @returns {Promise<string>}
	 */
	public async create({ uuid, title }: { uuid?: string; title?: string }): Promise<string> {
		const uuidToUse = uuid ? uuid : await uuidv4()
		const titleToUse = title ? title : simpleDate(Date.now())
		const key = await this.sdk.getWorker().crypto.utils.generateEncryptionKey("metadata")

		const [metadataEncrypted, titleEncrypted] = await Promise.all([
			this.sdk.getWorker().crypto.encrypt.metadata({
				metadata: JSON.stringify({
					key
				})
			}),
			this.sdk.getWorker().crypto.encrypt.noteTitle({
				title: titleToUse,
				key
			})
		])

		await this.sdk._locks.notesWrite.acquire()

		try {
			await this.sdk.api(3).notes().create({
				uuid: uuidToUse,
				title: titleEncrypted,
				metadata: metadataEncrypted
			})

			this._noteKeyCache.set(uuidToUse, key)

			await this.addParticipant({
				uuid: uuidToUse,
				contactUUID: "owner",
				permissionsWrite: true,
				publicKey: this.sdk.config.publicKey!
			})

			return uuidToUse
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Fetch note content.
	 * @date 2/20/2024 - 12:32:49 AM
	 *
	 * @public
	 * @async
	 * @param {{
	 * 		uuid: string
	 * 	}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<{ content: string; type: NoteType; editedTimestamp: number; editorId: number; preview: string }>}
	 */
	public async content({
		uuid
	}: {
		uuid: string
	}): Promise<{ content: string; type: NoteType; editedTimestamp: number; editorId: number; preview: string }> {
		const contentEncrypted = await this.sdk.api(3).notes().content({
			uuid
		})

		let content = ""

		if (contentEncrypted.content.length === 0) {
			if (contentEncrypted.type === "checklist") {
				// eslint-disable-next-line quotes
				content = '<ul data-checked="false"><li><br></li></ul>'
			} else {
				content = ""
			}

			return {
				content,
				type: contentEncrypted.type,
				editedTimestamp: contentEncrypted.editedTimestamp,
				editorId: contentEncrypted.editorId,
				preview: ""
			}
		}

		const decryptedNoteKey = await this.noteKey({
			uuid
		})

		const notePreviewPromise =
			contentEncrypted.preview.length === 0
				? Promise.resolve("")
				: this.sdk.getWorker().crypto.decrypt.notePreview({
						preview: contentEncrypted.preview,
						key: decryptedNoteKey
				  })

		const [contentDecrypted, previewDecrypted] = await Promise.all([
			this.sdk.getWorker().crypto.decrypt.noteContent({
				content: contentEncrypted.content,
				key: decryptedNoteKey
			}),
			notePreviewPromise
		])

		if (
			contentEncrypted.type === "checklist" &&
			(contentDecrypted === "" || contentDecrypted.indexOf("<ul data-checked") === -1 || contentDecrypted === "<p><br></p>")
		) {
			// eslint-disable-next-line quotes
			content = '<ul data-checked="false"><li><br></li></ul>'
		} else {
			content = contentDecrypted
		}

		return {
			content,
			type: contentEncrypted.type,
			editedTimestamp: contentEncrypted.editedTimestamp,
			editorId: contentEncrypted.editorId,
			preview: previewDecrypted
		}
	}

	/**
	 * Change note type.
	 * @date 2/20/2024 - 12:39:02 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; newType: NoteType; }} param0
	 * @param {string} param0.uuid
	 * @param {NoteType} param0.newType
	 * @returns {Promise<void>}
	 */
	public async changeType({ uuid, newType }: { uuid: string; newType: NoteType }): Promise<void> {
		await this.sdk._locks.notesWrite.acquire()

		try {
			const [decryptedNoteKey, decryptedNoteContent, noteInfo] = await Promise.all([
				this.noteKey({
					uuid
				}),
				this.content({
					uuid
				}),
				this.get({
					uuid
				})
			])

			const strippedContent =
				(noteInfo.type === "checklist" || noteInfo.type === "rich") && decryptedNoteContent.content.length > 0
					? striptags(decryptedNoteContent.content)
					: decryptedNoteContent.content

			const [contentEncrypted, previewEncrypted] = await Promise.all([
				this.sdk.getWorker().crypto.encrypt.noteContent({
					content: strippedContent,
					key: decryptedNoteKey
				}),
				this.sdk.getWorker().crypto.encrypt.notePreview({
					preview: createNotePreviewFromContentText({
						content: strippedContent,
						type: newType
					}),
					key: decryptedNoteKey
				})
			])

			await this.sdk.api(3).notes().typeChange({
				uuid,
				type: newType,
				preview: previewEncrypted,
				content: contentEncrypted
			})
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Edit a note.
	 * @date 2/20/2024 - 12:43:56 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; content: string; type: NoteType }} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.content
	 * @param {NoteType} param0.type
	 * @returns {Promise<void>}
	 */
	public async edit({ uuid, content, type }: { uuid: string; content: string; type: NoteType }): Promise<void> {
		const decryptedNoteKey = await this.noteKey({
			uuid
		})

		const preview = createNotePreviewFromContentText({
			content,
			type
		})

		const [contentEncrypted, previewEncrypted] = await Promise.all([
			this.sdk.getWorker().crypto.encrypt.noteContent({
				content,
				key: decryptedNoteKey
			}),
			this.sdk.getWorker().crypto.encrypt.notePreview({
				preview,
				key: decryptedNoteKey
			})
		])

		if (contentEncrypted.length >= MAX_NOTE_SIZE) {
			throw new Error(`Encrypted note content size too big, maximum is ${MAX_NOTE_SIZE} bytes.`)
		}

		await this.sdk._locks.notesWrite.acquire()

		try {
			await this.sdk.api(3).notes().contentEdit({
				uuid,
				preview: previewEncrypted,
				content: contentEncrypted,
				type
			})
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Edit a note's title.
	 * @date 4/1/2024 - 5:46:41 PM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, title: string}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.title
	 * @returns {Promise<void>}
	 */
	public async editTitle({ uuid, title }: { uuid: string; title: string }): Promise<void> {
		const decryptedNoteKey = await this.noteKey({
			uuid
		})

		const titleEncrypted = await this.sdk.getWorker().crypto.encrypt.noteTitle({
			title,
			key: decryptedNoteKey
		})

		await this.sdk._locks.notesWrite.acquire()

		try {
			await this.sdk.api(3).notes().titleEdit({
				uuid,
				title: titleEncrypted
			})
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Delete a note.
	 * @date 2/20/2024 - 12:48:38 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async delete({ uuid }: { uuid: string }): Promise<void> {
		await this.sdk._locks.notesWrite.acquire()

		try {
			await this.sdk.api(3).notes().delete({
				uuid
			})
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Archive a note.
	 * @date 2/20/2024 - 12:48:44 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async archive({ uuid }: { uuid: string }): Promise<void> {
		await this.sdk._locks.notesWrite.acquire()

		try {
			await this.sdk.api(3).notes().archive({
				uuid
			})
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Trash a note.
	 * @date 2/20/2024 - 12:48:48 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async trash({ uuid }: { uuid: string }): Promise<void> {
		await this.sdk._locks.notesWrite.acquire()

		try {
			await this.sdk.api(3).notes().trash({
				uuid
			})
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Toggle the favorite status of a note.
	 * @date 2/20/2024 - 12:52:30 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, favorite: boolean}} param0
	 * @param {string} param0.uuid
	 * @param {boolean} param0.favorite
	 * @returns {Promise<void>}
	 */
	public async favorite({ uuid, favorite }: { uuid: string; favorite: boolean }): Promise<void> {
		await this.sdk.api(3).notes().favorite({
			uuid,
			favorite
		})
	}

	/**
	 * Toggle the pinned status of a note.
	 * @date 2/20/2024 - 12:53:31 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string; pin: boolean }} param0
	 * @param {string} param0.uuid
	 * @param {boolean} param0.pin
	 * @returns {Promise<void>}
	 */
	public async pin({ uuid, pin }: { uuid: string; pin: boolean }): Promise<void> {
		await this.sdk.api(3).notes().pinned({
			uuid,
			pinned: pin
		})
	}

	/**
	 * Restore a note from the archive or trash.
	 * @date 2/20/2024 - 12:52:46 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async restore({ uuid }: { uuid: string }): Promise<void> {
		await this.sdk._locks.notesWrite.acquire()

		try {
			await this.sdk.api(3).notes().restore({
				uuid
			})
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Duplicate a note.
	 * @date 2/20/2024 - 1:40:38 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<string>}
	 */
	public async duplicate({ uuid }: { uuid: string }): Promise<string> {
		await this.sdk._locks.notesWrite.acquire()

		try {
			const [contentDecrypted, allNotes] = await Promise.all([
				this.content({
					uuid
				}),
				this.all()
			])

			const note = allNotes.filter(note => note.uuid === uuid)

			if (note.length === 0 || !note[0]) {
				throw new Error(`Could not find note ${uuid}.`)
			}

			const newUUID = await uuidv4()

			await this.create({
				uuid: newUUID,
				title: note[0].title
			})

			await this.addParticipant({
				uuid: newUUID,
				contactUUID: "owner",
				permissionsWrite: true,
				publicKey: this.sdk.config.publicKey!
			})

			await this.changeType({
				uuid: newUUID,
				newType: contentDecrypted.type
			})

			await this.edit({
				uuid: newUUID,
				content: contentDecrypted.content,
				type: contentDecrypted.type
			})

			return newUUID
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Fetch a content history of a note.
	 * @date 2/20/2024 - 2:03:38 AM
	 *
	 * @public
	 * @async
	 * @param {{ uuid: string }} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<NoteHistory[]>}
	 */
	public async history({ uuid }: { uuid: string }): Promise<NoteHistory[]> {
		const [_history, decryptedNoteKey] = await Promise.all([
			this.sdk.api(3).notes().history({
				uuid
			}),
			this.noteKey({
				uuid
			})
		])

		const notesHistory: NoteHistory[] = []
		const promises: Promise<void>[] = []

		for (const noteHistory of _history) {
			if (noteHistory.content.length === 0 || noteHistory.preview.length === 0) {
				continue
			}

			promises.push(
				new Promise<void>((resolve, reject) => {
					Promise.all([
						this.sdk.getWorker().crypto.decrypt.noteContent({
							content: noteHistory.content,
							key: decryptedNoteKey
						}),
						this.sdk.getWorker().crypto.decrypt.notePreview({
							preview: noteHistory.preview,
							key: decryptedNoteKey
						})
					])
						.then(([noteHistoryContentDecrypted, noteHistoryPreviewDecrypted]) => {
							notesHistory.push({
								...noteHistory,
								content: noteHistoryContentDecrypted,
								preview: noteHistoryPreviewDecrypted
							})

							resolve()
						})
						.catch(reject)
				})
			)
		}

		await promiseAllSettledChunked(promises)

		return notesHistory
	}

	/**
	 * Restore a note from history.
	 * @date 2/20/2024 - 4:46:26 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, id: number}} param0
	 * @param {string} param0.uuid
	 * @param {number} param0.id
	 * @returns {Promise<void>}
	 */
	public async restoreHistory({ uuid, id }: { uuid: string; id: number }): Promise<void> {
		await this.sdk._locks.notesWrite.acquire()

		try {
			await this.sdk.api(3).notes().historyRestore({
				uuid,
				id
			})
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Add a tag to a note.
	 * @date 2/20/2024 - 2:38:49 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, tag: string}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.tag
	 * @returns {Promise<void>}
	 */
	public async tag({ uuid, tag }: { uuid: string; tag: string }): Promise<void> {
		await this.sdk._locks.notesWrite.acquire()

		try {
			await this.sdk.api(3).notes().tag({
				uuid,
				tag
			})
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Remove a tag from a note.
	 * @date 2/20/2024 - 2:38:54 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, tag: string}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.tag
	 * @returns {Promise<void>}
	 */
	public async untag({ uuid, tag }: { uuid: string; tag: string }): Promise<void> {
		await this.sdk._locks.notesWrite.acquire()

		try {
			await this.sdk.api(3).notes().untag({
				uuid,
				tag
			})
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Fetch all tags.
	 * @date 2/20/2024 - 3:56:32 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<NoteTag[]>}
	 */
	public async tags(): Promise<NoteTag[]> {
		const _tags = await this.sdk.api(3).notes().tags()
		const notesTags: NoteTag[] = []
		const promises: Promise<void>[] = []

		for (const tag of _tags) {
			promises.push(
				new Promise<void>((resolve, reject) => {
					this.sdk
						.getWorker()
						.crypto.decrypt.noteTagName({
							name: tag.name
						})
						.then(decryptedTagName => {
							notesTags.push({
								...tag,
								name: decryptedTagName.length > 0 ? decryptedTagName : `CANNOT_DECRYPT_NAME_${tag.uuid}`
							})

							resolve()
						})
						.catch(reject)
				})
			)
		}

		await promiseAllSettledChunked(promises)

		return notesTags
	}

	/**
	 * Fetch all favorited tags.
	 * @date 2/20/2024 - 3:58:08 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<NoteTag[]>}
	 */
	public async tagsFavorited(): Promise<NoteTag[]> {
		const allTags = await this.tags()

		return allTags.filter(tag => tag.favorite)
	}

	/**
	 * Fetch all tags sorted by edited timestamp.
	 * @date 2/20/2024 - 3:58:15 AM
	 *
	 * @public
	 * @async
	 * @returns {Promise<NoteTag[]>}
	 */
	public async tagsRecents(): Promise<NoteTag[]> {
		const allTags = await this.tags()

		return allTags.sort((a, b) => b.editedTimestamp - a.editedTimestamp)
	}

	/**
	 * Create a tag.
	 * @date 2/20/2024 - 3:21:37 AM
	 *
	 * @public
	 * @async
	 * @param {{name: string}} param0
	 * @param {string} param0.name
	 * @returns {Promise<string>}
	 */
	public async createTag({ name }: { name: string }): Promise<string> {
		await this.sdk._locks.notesWrite.acquire()

		try {
			const allTags = await this.tags()
			const filtered = allTags.filter(tag => tag.name === name)

			if (filtered.length !== 0 && filtered[0]) {
				return filtered[0].uuid
			}

			const nameEncrypted = await this.sdk.getWorker().crypto.encrypt.noteTagName({
				name
			})
			const response = await this.sdk.api(3).notes().tagsCreate({
				name: nameEncrypted
			})

			return response.uuid
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Rename a tag.
	 * @date 2/20/2024 - 4:01:29 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, name: string}} param0
	 * @param {string} param0.uuid
	 * @param {string} param0.name
	 * @returns {Promise<void>}
	 */
	public async renameTag({ uuid, name }: { uuid: string; name: string }): Promise<void> {
		await this.sdk._locks.notesWrite.acquire()

		try {
			const allTags = await this.tags()
			const filtered = allTags.filter(tag => tag.name === name)

			if (filtered.length !== 0) {
				throw new Error(`Tag with name ${name} already exists.`)
			}

			const nameEncrypted = await this.sdk.getWorker().crypto.encrypt.noteTagName({
				name
			})

			await this.sdk.api(3).notes().tagsRename({
				uuid,
				name: nameEncrypted
			})
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}

	/**
	 * Toggle the favorite status of a tag.
	 * @date 2/20/2024 - 4:02:16 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string, favorite: boolean}} param0
	 * @param {string} param0.uuid
	 * @param {boolean} param0.favorite
	 * @returns {Promise<void>}
	 */
	public async tagFavorite({ uuid, favorite }: { uuid: string; favorite: boolean }): Promise<void> {
		await this.sdk.api(3).notes().tagsFavorite({
			uuid,
			favorite
		})
	}

	/**
	 * Delete a tag.
	 * @date 2/20/2024 - 4:03:05 AM
	 *
	 * @public
	 * @async
	 * @param {{uuid: string}} param0
	 * @param {string} param0.uuid
	 * @returns {Promise<void>}
	 */
	public async deleteTag({ uuid }: { uuid: string }): Promise<void> {
		await this.sdk._locks.notesWrite.acquire()

		try {
			await this.sdk.api(3).notes().tagsDelete({
				uuid
			})
		} finally {
			await this.sdk._locks.notesWrite.release().catch(() => {})
		}
	}
}

export default Notes
