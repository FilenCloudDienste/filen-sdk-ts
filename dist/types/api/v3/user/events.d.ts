import type APIClient from "../../client";
export type UserEvent = {
    id: number;
    info: {
        ip: string;
        userAgent: string;
    };
    timestamp: number;
    type: string;
    uuid: string;
};
export type UserEventsResponse = {
    events: UserEvent[];
};
/**
 * UserEvents
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserEvents
 * @typedef {UserEvents}
 */
export declare class UserEvents {
    private readonly apiClient;
    /**
     * Creates an instance of UserEvents.
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
     * Get user account events.
     * @date 2/20/2024 - 7:09:44 AM
     *
     * @public
     * @async
     * @param {{
     * 		lastTimestamp: number
     * 		filter: string
     * 	}} param0
     * @param {number} param0.lastTimestamp
     * @param {string} param0.filter
     * @returns {Promise<UserEvent[]>}
     */
    fetch({ lastTimestamp, filter }: {
        lastTimestamp: number;
        filter: string;
    }): Promise<UserEvent[]>;
}
export default UserEvents;
