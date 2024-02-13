import type APIClient from "../../../client";
import type { NoteType } from "../../notes";
/**
 * NotesContentEdit
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesContentEdit
 * @typedef {NotesContentEdit}
 */
export declare class NotesContentEdit {
    private readonly apiClient;
    /**
     * Creates an instance of NotesContentEdit.
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
     * Edit a note.
     * @date 2/13/2024 - 5:28:18 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; preview: string; content: string, type: NoteType }} param0
     * @param {string} param0.uuid
     * @param {string} param0.preview
     * @param {string} param0.content
     * @param {NoteType} param0.type
     * @returns {Promise<void>}
     */
    fetch({ uuid, preview, content, type }: {
        uuid: string;
        preview: string;
        content: string;
        type: NoteType;
    }): Promise<void>;
}
export default NotesContentEdit;
