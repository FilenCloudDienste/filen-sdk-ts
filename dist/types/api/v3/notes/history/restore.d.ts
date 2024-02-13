import type APIClient from "../../../client";
/**
 * NotesHistoryRestore
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesHistoryRestore
 * @typedef {NotesHistoryRestore}
 */
export declare class NotesHistoryRestore {
    private readonly apiClient;
    /**
     * Creates an instance of NotesHistoryRestore.
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
     * Restore a note from history.
     * @date 2/13/2024 - 5:45:45 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; id: number }} param0
     * @param {string} param0.uuid
     * @param {number} param0.id
     * @returns {Promise<void>}
     */
    fetch({ uuid, id }: {
        uuid: string;
        id: number;
    }): Promise<void>;
}
export default NotesHistoryRestore;
