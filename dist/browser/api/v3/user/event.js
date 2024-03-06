/**
 * UserEvent
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserEvent
 * @typedef {UserEvent}
 */
export class UserEvent {
    apiClient;
    /**
     * Creates an instance of UserEvent.
     * @date 2/1/2024 - 8:16:39 PM
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
     * Get event information.
     * @date 2/10/2024 - 2:09:37 AM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 	}} param0
     * @param {string} param0.uuid
     * @returns {Promise<UserEventResponse>}
     */
    async fetch({ uuid }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/user/event",
            data: {
                uuid
            }
        });
        return response;
    }
}
export default UserEvent;
//# sourceMappingURL=event.js.map