import type APIClient from "../../client";
import type { ChatLastFocusValues } from "./lastFocusUpdate";
/**
 * ChatLastFocus
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class ChatLastFocus
 * @typedef {ChatLastFocus}
 */
export declare class ChatLastFocus {
    private readonly apiClient;
    /**
     * Creates an instance of ChatLastFocus.
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
     * Fetch chat last focus values.
     * @date 2/13/2024 - 6:40:39 AM
     *
     * @public
     * @async
     * @returns {Promise<ChatLastFocusValues[]>}
     */
    fetch(): Promise<ChatLastFocusValues[]>;
}
export default ChatLastFocus;
