import type APIClient from "../../client";
/**
 * NotesPinned
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesPinned
 * @typedef {NotesPinned}
 */
export declare class NotesPinned {
    private readonly apiClient;
    /**
     * Creates an instance of NotesPinned.
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
     * Toggle the pinned status of a note.
     * @date 2/13/2024 - 5:40:57 AM
     *
     * @public
     * @async
     * @param {{ uuid: string, pinned: boolean }} param0
     * @param {string} param0.uuid
     * @param {boolean} param0.pinned
     * @returns {Promise<void>}
     */
    fetch({ uuid, pinned }: {
        uuid: string;
        pinned: boolean;
    }): Promise<void>;
}
export default NotesPinned;
