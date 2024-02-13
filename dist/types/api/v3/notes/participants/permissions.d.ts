import type APIClient from "../../../client";
/**
 * NotesParticipantsPermissions
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesParticipantsPermissions
 * @typedef {NotesParticipantsPermissions}
 */
export declare class NotesParticipantsPermissions {
    private readonly apiClient;
    /**
     * Creates an instance of NotesParticipantsPermissions.
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
     * Change permissions of a note participant.
     * @date 2/13/2024 - 5:52:06 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; userId: number, permissionsWrite: boolean }} param0
     * @param {string} param0.uuid
     * @param {number} param0.userId
     * @param {boolean} param0.permissionsWrite
     * @returns {Promise<void>}
     */
    fetch({ uuid, userId, permissionsWrite }: {
        uuid: string;
        userId: number;
        permissionsWrite: boolean;
    }): Promise<void>;
}
export default NotesParticipantsPermissions;
