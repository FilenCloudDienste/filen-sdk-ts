import type API from "../api";
import type { FilenSDKConfig, FilenSDK } from "..";
import type { NoteType, Note, NoteTag } from "../api/v3/notes";
import type { NoteHistory } from "../api/v3/notes/history";
export type NotesConfig = {
    sdkConfig: FilenSDKConfig;
    api: API;
    sdk: FilenSDK;
};
/**
 * Notes
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class Notes
 * @typedef {Notes}
 */
export declare class Notes {
    private readonly api;
    private readonly sdkConfig;
    private readonly _noteKeyCache;
    private readonly sdk;
    /**
     * Creates an instance of Notes.
     * @date 2/9/2024 - 5:54:11 AM
     *
     * @constructor
     * @public
     * @param {NotesConfig} params
     */
    constructor(params: NotesConfig);
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
    allTags({ tags }: {
        tags: NoteTag[];
    }): Promise<NoteTag[]>;
    /**
     * Fetch all notes.
     * @date 2/20/2024 - 12:26:30 AM
     *
     * @public
     * @async
     * @returns {Promise<Note[]>}
     */
    all(): Promise<Note[]>;
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
    get({ uuid }: {
        uuid: string;
    }): Promise<Note>;
    /**
     * Fetch all archived notes.
     * @date 2/20/2024 - 12:50:24 AM
     *
     * @public
     * @async
     * @returns {Promise<Note[]>}
     */
    archived(): Promise<Note[]>;
    /**
     * Fetch all trashed notes.
     * @date 2/20/2024 - 12:50:33 AM
     *
     * @public
     * @async
     * @returns {Promise<Note[]>}
     */
    trashed(): Promise<Note[]>;
    /**
     * Fetch all favorited notes.
     * @date 2/20/2024 - 12:50:40 AM
     *
     * @public
     * @async
     * @returns {Promise<Note[]>}
     */
    favorited(): Promise<Note[]>;
    /**
     * Fetch all pinned notes.
     * @date 2/20/2024 - 12:53:55 AM
     *
     * @public
     * @async
     * @returns {Promise<Note[]>}
     */
    pinned(): Promise<Note[]>;
    /**
     * Fetch all notes ordered by last edit timestamp.
     * @date 2/20/2024 - 12:51:06 AM
     *
     * @public
     * @async
     * @returns {Promise<Note[]>}
     */
    recents(): Promise<Note[]>;
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
    noteKey({ uuid }: {
        uuid: string;
    }): Promise<string>;
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
    addParticipant({ uuid, contactUUID, permissionsWrite, publicKey }: {
        uuid: string;
        contactUUID: string;
        permissionsWrite: boolean;
        publicKey: string;
    }): Promise<void>;
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
    removeParticipant({ uuid, userId }: {
        uuid: string;
        userId: number;
    }): Promise<void>;
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
    participantPermissions({ uuid, permissionsWrite, userId }: {
        uuid: string;
        permissionsWrite: boolean;
        userId: number;
    }): Promise<void>;
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
    create({ uuid, title }: {
        uuid?: string;
        title?: string;
    }): Promise<string>;
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
    content({ uuid }: {
        uuid: string;
    }): Promise<{
        content: string;
        type: NoteType;
        editedTimestamp: number;
        editorId: number;
        preview: string;
    }>;
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
    changeType({ uuid, newType }: {
        uuid: string;
        newType: NoteType;
    }): Promise<void>;
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
    edit({ uuid, content, type }: {
        uuid: string;
        content: string;
        type: NoteType;
    }): Promise<void>;
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
    editTitle({ uuid, title }: {
        uuid: string;
        title: string;
    }): Promise<void>;
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
    delete({ uuid }: {
        uuid: string;
    }): Promise<void>;
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
    archive({ uuid }: {
        uuid: string;
    }): Promise<void>;
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
    trash({ uuid }: {
        uuid: string;
    }): Promise<void>;
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
    favorite({ uuid, favorite }: {
        uuid: string;
        favorite: boolean;
    }): Promise<void>;
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
    pin({ uuid, pin }: {
        uuid: string;
        pin: boolean;
    }): Promise<void>;
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
    restore({ uuid }: {
        uuid: string;
    }): Promise<void>;
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
    duplicate({ uuid }: {
        uuid: string;
    }): Promise<string>;
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
    history({ uuid }: {
        uuid: string;
    }): Promise<NoteHistory[]>;
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
    restoreHistory({ uuid, id }: {
        uuid: string;
        id: number;
    }): Promise<void>;
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
    tag({ uuid, tag }: {
        uuid: string;
        tag: string;
    }): Promise<void>;
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
    untag({ uuid, tag }: {
        uuid: string;
        tag: string;
    }): Promise<void>;
    /**
     * Fetch all tags.
     * @date 2/20/2024 - 3:56:32 AM
     *
     * @public
     * @async
     * @returns {Promise<NoteTag[]>}
     */
    tags(): Promise<NoteTag[]>;
    /**
     * Fetch all favorited tags.
     * @date 2/20/2024 - 3:58:08 AM
     *
     * @public
     * @async
     * @returns {Promise<NoteTag[]>}
     */
    tagsFavorited(): Promise<NoteTag[]>;
    /**
     * Fetch all tags sorted by edited timestamp.
     * @date 2/20/2024 - 3:58:15 AM
     *
     * @public
     * @async
     * @returns {Promise<NoteTag[]>}
     */
    tagsRecents(): Promise<NoteTag[]>;
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
    createTag({ name }: {
        name: string;
    }): Promise<string>;
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
    renameTag({ uuid, name }: {
        uuid: string;
        name: string;
    }): Promise<void>;
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
    tagFavorite({ uuid, favorite }: {
        uuid: string;
        favorite: boolean;
    }): Promise<void>;
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
    deleteTag({ uuid }: {
        uuid: string;
    }): Promise<void>;
}
export default Notes;
