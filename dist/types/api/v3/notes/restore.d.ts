import type APIClient from "../../client";
/**
 * NotesRestore
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesRestore
 * @typedef {NotesRestore}
 */
export declare class NotesRestore {
    private readonly apiClient;
    /**
     * Creates an instance of NotesRestore.
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
     * Restore a note.
     * @date 2/13/2024 - 5:31:43 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; }} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<void>;
}
export default NotesRestore;
