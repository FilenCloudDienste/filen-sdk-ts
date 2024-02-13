import type APIClient from "../../client";
import type { NoteType } from "../notes";
export type NoteHistory = {
    id: number;
    preview: string;
    content: string;
    editedTimestamp: number;
    editorId: number;
    type: NoteType;
};
export type NotesHistoryResponse = NoteHistory[];
/**
 * NotesHistory
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesHistory
 * @typedef {NotesHistory}
 */
export declare class NotesHistory {
    private readonly apiClient;
    /**
     * Creates an instance of NotesHistory.
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
     * Fetch a note's history.
     * @date 2/13/2024 - 5:43:55 AM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<NotesHistoryResponse>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<NotesHistoryResponse>;
}
export default NotesHistory;
