import type APIClient from "../../../client";
/**
 * NotesTagsDelete
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class NotesTagsDelete
 * @typedef {NotesTagsDelete}
 */
export declare class NotesTagsDelete {
    private readonly apiClient;
    /**
     * Creates an instance of NotesTagsDelete.
     * @date 2/1/2024 - 8:16:39 PM
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
     * Delete a note tag.
     * @date 2/13/2024 - 6:23:19 AM
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
export default NotesTagsDelete;
