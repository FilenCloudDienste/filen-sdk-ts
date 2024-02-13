import type APIClient from "../../client";
import type { NoteType } from "../notes";
export type NoteContent = {
    preview: string;
    content: string;
    editedTimestamp: number;
    editorId: number;
    type: NoteType;
};
export type NotesContentResponse = NoteContent;
/**
 * NotesContent
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesContent
 * @typedef {NotesContent}
 */
export declare class NotesContent {
    private readonly apiClient;
    /**
     * Creates an instance of NotesContent.
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
     * Fetch note content.
     * @date 2/13/2024 - 5:24:20 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<NotesContentResponse>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<NotesContentResponse>;
}
export default NotesContent;
