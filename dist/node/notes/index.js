"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notes = void 0;
const utils_1 = require("../utils");
const utils_2 = require("./utils");
const constants_1 = require("../constants");
const striptags_1 = __importDefault(require("striptags"));
/**
 * Notes
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class Notes
 * @typedef {Notes}
 */
class Notes {
    /**
     * Creates an instance of Notes.
     * @date 2/9/2024 - 5:54:11 AM
     *
     * @constructor
     * @public
     * @param {NotesConfig} params
     */
    constructor(params) {
        this._noteKeyCache = new Map();
        this.api = params.api;
        this.sdkConfig = params.sdkConfig;
        this.sdk = params.sdk;
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
    async allTags({ tags }) {
        const decryptedTags = [];
        const promises = [];
        for (const tag of tags) {
            promises.push(new Promise((resolve, reject) => {
                this.sdk
                    .getWorker()
                    .crypto.decrypt.noteTagName({ name: tag.name })
                    .then(decryptedTagName => {
                    decryptedTags.push(Object.assign(Object.assign({}, tag), { name: decryptedTagName.length > 0 ? decryptedTagName : `CANNOT_DECRYPT_NAME_${tag.uuid}` }));
                    resolve();
                })
                    .catch(reject);
            }));
        }
        await (0, utils_1.promiseAllChunked)(promises);
        return decryptedTags;
    }
    /**
     * Fetch all notes.
     * @date 2/20/2024 - 12:26:30 AM
     *
     * @public
     * @async
     * @returns {Promise<Note[]>}
     */
    async all() {
        const allNotes = await this.api.v3().notes().all();
        const notes = [];
        const promises = [];
        for (const note of allNotes) {
            promises.push(new Promise((resolve, reject) => {
                const participantMetadata = note.participants.filter(participant => participant.userId === this.sdkConfig.userId);
                if (participantMetadata.length === 0 || !participantMetadata[0]) {
                    reject(new Error("Could not find user as a participant."));
                    return;
                }
                const decryptKeyPromise = this._noteKeyCache.has(note.uuid)
                    ? Promise.resolve(this._noteKeyCache.get(note.uuid))
                    : this.noteKey({ uuid: note.uuid });
                decryptKeyPromise
                    .then(decryptedNoteKey => {
                    this._noteKeyCache.set(note.uuid, decryptedNoteKey);
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
                            this.allTags({ tags: note.tags })
                        ])
                            .then(([decryptedNotePreview, decryptedNoteTags]) => {
                            notes.push(Object.assign(Object.assign({}, note), { title: decryptedNoteTitle, preview: decryptedNotePreview, tags: decryptedNoteTags }));
                            resolve();
                        })
                            .catch(reject);
                    })
                        .catch(reject);
                })
                    .catch(reject);
            }));
        }
        await (0, utils_1.promiseAllChunked)(promises);
        return notes;
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
    async get({ uuid }) {
        const all = await this.all();
        const note = all.filter(note => note.uuid === uuid);
        if (note.length === 0 || !note[0]) {
            throw new Error(`Note ${uuid} not found.`);
        }
        return note[0];
    }
    /**
     * Fetch all archived notes.
     * @date 2/20/2024 - 12:50:24 AM
     *
     * @public
     * @async
     * @returns {Promise<Note[]>}
     */
    async archived() {
        const all = await this.all();
        return all.filter(note => note.archive);
    }
    /**
     * Fetch all trashed notes.
     * @date 2/20/2024 - 12:50:33 AM
     *
     * @public
     * @async
     * @returns {Promise<Note[]>}
     */
    async trashed() {
        const all = await this.all();
        return all.filter(note => note.trash);
    }
    /**
     * Fetch all favorited notes.
     * @date 2/20/2024 - 12:50:40 AM
     *
     * @public
     * @async
     * @returns {Promise<Note[]>}
     */
    async favorited() {
        const all = await this.all();
        return all.filter(note => note.favorite);
    }
    /**
     * Fetch all pinned notes.
     * @date 2/20/2024 - 12:53:55 AM
     *
     * @public
     * @async
     * @returns {Promise<Note[]>}
     */
    async pinned() {
        const all = await this.all();
        return all.filter(note => note.pinned);
    }
    /**
     * Fetch all notes ordered by last edit timestamp.
     * @date 2/20/2024 - 12:51:06 AM
     *
     * @public
     * @async
     * @returns {Promise<Note[]>}
     */
    async recents() {
        const all = await this.all();
        return all.sort((a, b) => b.editedTimestamp - a.editedTimestamp);
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
    async noteKey({ uuid }) {
        if (this._noteKeyCache.has(uuid)) {
            return this._noteKeyCache.get(uuid);
        }
        const all = await this.api.v3().notes().all();
        const note = all.filter(note => note.uuid === uuid);
        if (note.length === 0 || !note[0]) {
            throw new Error(`Could not find note ${uuid}.`);
        }
        if (note[0].ownerId === this.sdkConfig.userId) {
            const decryptedNoteKey = await this.sdk.getWorker().crypto.decrypt.noteKeyOwner({ metadata: note[0].metadata });
            this._noteKeyCache.set(uuid, decryptedNoteKey);
            return decryptedNoteKey;
        }
        const participant = note[0].participants.filter(participant => participant.userId === this.sdkConfig.userId);
        if (participant.length === 0 || !participant[0]) {
            throw new Error(`Could not find participant metadata for note ${uuid}.`);
        }
        const decryptedNoteKey = await this.sdk.getWorker().crypto.decrypt.noteKeyParticipant({
            metadata: participant[0].metadata,
            privateKey: this.sdkConfig.privateKey
        });
        this._noteKeyCache.set(uuid, decryptedNoteKey);
        return decryptedNoteKey;
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
    async addParticipant({ uuid, contactUUID, permissionsWrite, publicKey }) {
        const decryptedNoteKey = await this.noteKey({ uuid });
        const metadata = await this.sdk.getWorker().crypto.encrypt.metadataPublic({
            metadata: JSON.stringify({ key: decryptedNoteKey }),
            publicKey
        });
        await this.api.v3().notes().participantsAdd({
            uuid,
            metadata,
            contactUUID,
            permissionsWrite
        });
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
    async removeParticipant({ uuid, userId }) {
        await this.api.v3().notes().participantsRemove({
            uuid,
            userId
        });
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
    async participantPermissions({ uuid, permissionsWrite, userId }) {
        await this.api.v3().notes().participantsPermissions({ uuid, userId, permissionsWrite });
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
    async create({ uuid, title }) {
        const uuidToUse = uuid ? uuid : await (0, utils_1.uuidv4)();
        const titleToUse = title ? title : (0, utils_1.simpleDate)(Date.now());
        const key = await this.sdk.getWorker().crypto.utils.generateRandomString({ length: 32 });
        const [metadataEncrypted, titleEncrypted] = await Promise.all([
            this.sdk.getWorker().crypto.encrypt.metadata({ metadata: JSON.stringify({ key }) }),
            this.sdk.getWorker().crypto.encrypt.noteTitle({
                title: titleToUse,
                key
            })
        ]);
        await this.api.v3().notes().create({
            uuid: uuidToUse,
            title: titleEncrypted,
            metadata: metadataEncrypted
        });
        this._noteKeyCache.set(uuidToUse, key);
        await this.addParticipant({
            uuid: uuidToUse,
            contactUUID: "owner",
            permissionsWrite: true,
            publicKey: this.sdkConfig.publicKey
        });
        return uuidToUse;
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
    async content({ uuid }) {
        const contentEncrypted = await this.api.v3().notes().content({ uuid });
        let content = "";
        if (contentEncrypted.content.length === 0) {
            if (contentEncrypted.type === "checklist") {
                // eslint-disable-next-line quotes
                content = '<ul data-checked="false"><li><br></li></ul>';
            }
            else {
                content = "";
            }
            return {
                content,
                type: contentEncrypted.type,
                editedTimestamp: contentEncrypted.editedTimestamp,
                editorId: contentEncrypted.editorId,
                preview: ""
            };
        }
        const decryptedNoteKey = await this.noteKey({ uuid });
        const notePreviewPromise = contentEncrypted.preview.length === 0
            ? Promise.resolve("")
            : this.sdk.getWorker().crypto.decrypt.notePreview({
                preview: contentEncrypted.preview,
                key: decryptedNoteKey
            });
        const [contentDecrypted, previewDecrypted] = await Promise.all([
            this.sdk.getWorker().crypto.decrypt.noteContent({
                content: contentEncrypted.content,
                key: decryptedNoteKey
            }),
            notePreviewPromise
        ]);
        if (contentEncrypted.type === "checklist" &&
            (contentDecrypted === "" || contentDecrypted.indexOf("<ul data-checked") === -1 || contentDecrypted === "<p><br></p>")) {
            // eslint-disable-next-line quotes
            content = '<ul data-checked="false"><li><br></li></ul>';
        }
        else {
            content = contentDecrypted;
        }
        return {
            content,
            type: contentEncrypted.type,
            editedTimestamp: contentEncrypted.editedTimestamp,
            editorId: contentEncrypted.editorId,
            preview: previewDecrypted
        };
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
    async changeType({ uuid, newType }) {
        const [decryptedNoteKey, decryptedNoteContent, noteInfo] = await Promise.all([
            this.noteKey({ uuid }),
            this.content({ uuid }),
            this.get({ uuid })
        ]);
        const strippedContent = (noteInfo.type === "checklist" || noteInfo.type === "rich") && decryptedNoteContent.content.length > 0
            ? (0, striptags_1.default)(decryptedNoteContent.content)
            : decryptedNoteContent.content;
        const [contentEncrypted, previewEncrypted] = await Promise.all([
            this.sdk.getWorker().crypto.encrypt.noteContent({
                content: strippedContent,
                key: decryptedNoteKey
            }),
            this.sdk.getWorker().crypto.encrypt.notePreview({
                preview: (0, utils_2.createNotePreviewFromContentText)({
                    content: strippedContent,
                    type: newType
                }),
                key: decryptedNoteKey
            })
        ]);
        await this.api.v3().notes().typeChange({
            uuid,
            type: newType,
            preview: previewEncrypted,
            content: contentEncrypted
        });
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
    async edit({ uuid, content, type }) {
        const decryptedNoteKey = await this.noteKey({ uuid });
        const preview = (0, utils_2.createNotePreviewFromContentText)({ content, type });
        const [contentEncrypted, previewEncrypted] = await Promise.all([
            this.sdk.getWorker().crypto.encrypt.noteContent({
                content,
                key: decryptedNoteKey
            }),
            this.sdk.getWorker().crypto.encrypt.notePreview({
                preview,
                key: decryptedNoteKey
            })
        ]);
        if (contentEncrypted.length >= constants_1.MAX_NOTE_SIZE) {
            throw new Error(`Encrypted note content size too big, maximum is ${constants_1.MAX_NOTE_SIZE} bytes.`);
        }
        await this.api.v3().notes().contentEdit({
            uuid,
            preview: previewEncrypted,
            content: contentEncrypted,
            type
        });
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
    async editTitle({ uuid, title }) {
        const decryptedNoteKey = await this.noteKey({ uuid });
        const titleEncrypted = await this.sdk.getWorker().crypto.encrypt.noteTitle({
            title,
            key: decryptedNoteKey
        });
        await this.api.v3().notes().titleEdit({
            uuid,
            title: titleEncrypted
        });
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
    async delete({ uuid }) {
        await this.api.v3().notes().delete({ uuid });
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
    async archive({ uuid }) {
        await this.api.v3().notes().archive({ uuid });
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
    async trash({ uuid }) {
        await this.api.v3().notes().trash({ uuid });
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
    async favorite({ uuid, favorite }) {
        await this.api.v3().notes().favorite({ uuid, favorite });
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
    async pin({ uuid, pin }) {
        await this.api.v3().notes().pinned({ uuid, pinned: pin });
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
    async restore({ uuid }) {
        await this.api.v3().notes().restore({ uuid });
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
    async duplicate({ uuid }) {
        const [contentDecrypted, allNotes] = await Promise.all([this.content({ uuid }), this.all()]);
        const note = allNotes.filter(note => note.uuid === uuid);
        if (note.length === 0 || !note[0]) {
            throw new Error(`Could not find note ${uuid}.`);
        }
        const newUUID = await (0, utils_1.uuidv4)();
        await this.create({ uuid: newUUID, title: note[0].title });
        await this.addParticipant({ uuid: newUUID, contactUUID: "owner", permissionsWrite: true, publicKey: this.sdkConfig.publicKey });
        await this.changeType({ uuid: newUUID, newType: contentDecrypted.type });
        await this.edit({ uuid: newUUID, content: contentDecrypted.content, type: contentDecrypted.type });
        return newUUID;
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
    async history({ uuid }) {
        const [_history, decryptedNoteKey] = await Promise.all([this.api.v3().notes().history({ uuid }), this.noteKey({ uuid })]);
        const notesHistory = [];
        const promises = [];
        for (const noteHistory of _history) {
            if (noteHistory.content.length === 0 || noteHistory.preview.length === 0) {
                continue;
            }
            promises.push(new Promise((resolve, reject) => {
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
                    notesHistory.push(Object.assign(Object.assign({}, noteHistory), { content: noteHistoryContentDecrypted, preview: noteHistoryPreviewDecrypted }));
                    resolve();
                })
                    .catch(reject);
            }));
        }
        await (0, utils_1.promiseAllChunked)(promises);
        return notesHistory;
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
    async restoreHistory({ uuid, id }) {
        await this.api.v3().notes().historyRestore({ uuid, id });
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
    async tag({ uuid, tag }) {
        await this.api.v3().notes().tag({ uuid, tag });
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
    async untag({ uuid, tag }) {
        await this.api.v3().notes().untag({ uuid, tag });
    }
    /**
     * Fetch all tags.
     * @date 2/20/2024 - 3:56:32 AM
     *
     * @public
     * @async
     * @returns {Promise<NoteTag[]>}
     */
    async tags() {
        const _tags = await this.api.v3().notes().tags();
        const notesTags = [];
        const promises = [];
        for (const tag of _tags) {
            promises.push(new Promise((resolve, reject) => {
                this.sdk
                    .getWorker()
                    .crypto.decrypt.noteTagName({ name: tag.name })
                    .then(decryptedTagName => {
                    notesTags.push(Object.assign(Object.assign({}, tag), { name: decryptedTagName.length > 0 ? decryptedTagName : `CANNOT_DECRYPT_NAME_${tag.uuid}` }));
                    resolve();
                })
                    .catch(reject);
            }));
        }
        await (0, utils_1.promiseAllChunked)(promises);
        return notesTags;
    }
    /**
     * Fetch all favorited tags.
     * @date 2/20/2024 - 3:58:08 AM
     *
     * @public
     * @async
     * @returns {Promise<NoteTag[]>}
     */
    async tagsFavorited() {
        const allTags = await this.tags();
        return allTags.filter(tag => tag.favorite);
    }
    /**
     * Fetch all tags sorted by edited timestamp.
     * @date 2/20/2024 - 3:58:15 AM
     *
     * @public
     * @async
     * @returns {Promise<NoteTag[]>}
     */
    async tagsRecents() {
        const allTags = await this.tags();
        return allTags.sort((a, b) => b.editedTimestamp - a.editedTimestamp);
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
    async createTag({ name }) {
        const allTags = await this.tags();
        const filtered = allTags.filter(tag => tag.name === name);
        if (filtered.length !== 0 && filtered[0]) {
            return filtered[0].uuid;
        }
        const nameEncrypted = await this.sdk.getWorker().crypto.encrypt.noteTagName({ name });
        const response = await this.api.v3().notes().tagsCreate({ name: nameEncrypted });
        return response.uuid;
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
    async renameTag({ uuid, name }) {
        const allTags = await this.tags();
        const filtered = allTags.filter(tag => tag.name === name);
        if (filtered.length !== 0) {
            throw new Error(`Tag with name ${name} already exists.`);
        }
        const nameEncrypted = await this.sdk.getWorker().crypto.encrypt.noteTagName({ name });
        await this.api.v3().notes().tagsRename({
            uuid,
            name: nameEncrypted
        });
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
    async tagFavorite({ uuid, favorite }) {
        await this.api.v3().notes().tagsFavorite({
            uuid,
            favorite
        });
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
    async deleteTag({ uuid }) {
        await this.api.v3().notes().tagsDelete({ uuid });
    }
}
exports.Notes = Notes;
exports.default = Notes;
//# sourceMappingURL=index.js.map