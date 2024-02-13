import type APIClient from "../../client";
/**
 * NotesFavorite
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesFavorite
 * @typedef {NotesFavorite}
 */
export declare class NotesFavorite {
    private readonly apiClient;
    /**
     * Creates an instance of NotesFavorite.
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
     * Toggle the favorite status of a note.
     * @date 2/13/2024 - 5:40:57 AM
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
export default NotesFavorite;
