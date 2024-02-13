import type APIClient from "../../../client";
export type NotesTagsCreateResponse = {
    uuid: string;
};
/**
 * NotesTagsCreate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class NotesTagsCreate
 * @typedef {NotesTagsCreate}
 */
export declare class NotesTagsCreate {
    private readonly apiClient;
    /**
     * Creates an instance of NotesTagsCreate.
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
     * Create a note tag.
     * @date 2/13/2024 - 6:20:19 AM
     *
     * @public
     * @async
     * @param {{ name: string }} param0
     * @param {string} param0.name
     * @returns {Promise<NotesTagsCreateResponse>}
     */
    fetch({ name }: {
        name: string;
    }): Promise<NotesTagsCreateResponse>;
}
export default NotesTagsCreate;
