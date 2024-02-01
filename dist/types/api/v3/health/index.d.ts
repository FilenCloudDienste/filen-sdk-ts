import type APIClient from "../../client";
/**
 * Health
 * @date 2/1/2024 - 3:23:04 AM
 *
 * @export
 * @class Health
 * @typedef {Health}
 */
export declare class Health {
    private readonly apiClient;
    /**
     * Creates an instance of Health.
     * @date 2/1/2024 - 3:19:24 PM
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
     * Returns "OK" when API is healthy.
     * @date 2/1/2024 - 3:23:14 AM
     *
     * @public
     * @async
     * @returns {Promise<"OK">}
     */
    fetch(): Promise<"OK">;
}
export default Health;
