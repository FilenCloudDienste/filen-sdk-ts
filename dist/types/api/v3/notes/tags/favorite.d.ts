import type APIClient from "../../../client";
/**
 * NotesTagsFavorite
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class NotesTagsFavorite
 * @typedef {NotesTagsFavorite}
 */
export declare class NotesTagsFavorite {
    private readonly apiClient;
    /**
     * Creates an instance of NotesTagsFavorite.
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
     * Toggle the favorite status of a note tag.
     * @date 2/13/2024 - 6:24:56 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, favorite: boolean }} param0
     * @param {string} param0.uuid
     * @param {boolean} param0.favorite
     * @returns {Promise<void>}
     */
    fetch({ uuid, favorite }: {
        uuid: string;
        favorite: boolean;
    }): Promise<void>;
}
export default NotesTagsFavorite;
