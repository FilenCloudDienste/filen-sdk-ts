import type APIClient from "../client";
export type NoteType = "text" | "md" | "code" | "rich" | "checklist";
export type NoteTag = {
    uuid: string;
    name: string;
    favorite: boolean;
    editedTimestamp: number;
    createdTimestamp: number;
};
export type NoteParticipant = {
    userId: number;
    isOwner: boolean;
    email: string;
    avatar: string | null;
    nickName: string;
    metadata: string;
    permissionsWrite: boolean;
    addedTimestamp: number;
};
export type Note = {
    uuid: string;
    ownerId: number;
    isOwner: boolean;
    favorite: boolean;
    pinned: boolean;
    tags: NoteTag[];
    type: NoteType;
    metadata: string;
    title: string;
    preview: string;
    trash: boolean;
    archive: boolean;
    createdTimestamp: number;
    editedTimestamp: number;
    participants: NoteParticipant[];
};
export type NotesResponse = Note[];
/**
 * Notes
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class Notes
 * @typedef {Notes}
 */
export declare class Notes {
    private readonly apiClient;
    /**
     * Creates an instance of Notes.
     * @date 2/1/2024 - 3:19:15 PM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }: {
        apiClient: APIClient;
    });
    /**
     * Fetch all notes.
     * @date 2/13/2024 - 5:21:41 AM
     *
     * @public
     * @async
     * @returns {Promise<NotesResponse>}
     */
    fetch(): Promise<NotesResponse>;
}
export default Notes;
