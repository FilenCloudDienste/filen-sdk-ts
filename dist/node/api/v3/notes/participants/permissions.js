"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesParticipantsPermissions = void 0;
/**
 * NotesParticipantsPermissions
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class NotesParticipantsPermissions
 * @typedef {NotesParticipantsPermissions}
 */
class NotesParticipantsPermissions {
    /**
     * Creates an instance of NotesParticipantsPermissions.
     * @date 2/1/2024 - 3:19:15 PM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }) {
        this.apiClient = apiClient;
    }
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
    async fetch({ uuid, userId, permissionsWrite }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/notes/participants/permissions",
            data: {
                uuid,
                userId,
                permissionsWrite
            }
        });
    }
}
exports.NotesParticipantsPermissions = NotesParticipantsPermissions;
exports.default = NotesParticipantsPermissions;
//# sourceMappingURL=permissions.js.map