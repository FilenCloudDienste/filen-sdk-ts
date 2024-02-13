import type APIClient from "../../client";
import type { NoteTag } from "../notes";
export type NotesTagsResponse = NoteTag[];
/**
 * NotesTags
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class NotesTags
 * @typedef {NotesTags}
 */
export declare class NotesTags {
    private readonly apiClient;
    /**
     * Creates an instance of NotesTags.
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
     * Fetch all note tags.
     * @date 2/13/2024 - 6:18:25 AM
     *
     * @public
     * @async
     * @returns {Promise<NotesTagsResponse>}
     */
    fetch(): Promise<NotesTagsResponse>;
}
export default NotesTags;
