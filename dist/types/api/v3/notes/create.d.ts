import type APIClient from "../../client";
/**
 * NotesCreate
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesCreate
 * @typedef {NotesCreate}
 */
export declare class NotesCreate {
    private readonly apiClient;
    /**
     * Creates an instance of NotesCreate.
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
     * Create a note.
     * @date 2/13/2024 - 5:26:26 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, title: string, metadata: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.title
     * @param {string} param0.metadata
     * @returns {Promise<void>}
     */
    fetch({ uuid, title, metadata }: {
        uuid: string;
        title: string;
        metadata: string;
    }): Promise<void>;
}
export default NotesCreate;
