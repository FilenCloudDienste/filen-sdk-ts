import type APIClient from "../../../client";
import type { NoteType } from "../../notes";
/**
 * NotesTypeChange
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesTypeChange
 * @typedef {NotesTypeChange}
 */
export declare class NotesTypeChange {
    private readonly apiClient;
    /**
     * Creates an instance of NotesTypeChange.
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
     * Change a note's type.
     * @date 2/13/2024 - 5:39:10 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, type: NoteType, preview: string, content: string }} param0
     * @param {string} param0.uuid
     * @param {NoteType} param0.type
     * @param {string} param0.preview
     * @param {string} param0.content
     * @returns {Promise<void>}
     */
    fetch({ uuid, type, preview, content }: {
        uuid: string;
        type: NoteType;
        preview: string;
        content: string;
    }): Promise<void>;
}
export default NotesTypeChange;
