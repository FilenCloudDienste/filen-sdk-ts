import type APIClient from "../../../client";
/**
 * NotesTagsRename
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class NotesTagsRename
 * @typedef {NotesTagsRename}
 */
export declare class NotesTagsRename {
    private readonly apiClient;
    /**
     * Creates an instance of NotesTagsRename.
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
     * Rename a note tag.
     * @date 2/13/2024 - 6:22:00 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, name: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.name
     * @returns {Promise<void>}
     */
    fetch({ uuid, name }: {
        uuid: string;
        name: string;
    }): Promise<void>;
}
export default NotesTagsRename;
