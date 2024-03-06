/**
 * SharedIn
 * @date 2/1/2024 - 4:04:02 PM
 *
 * @export
 * @class SharedIn
 * @typedef {SharedIn}
 */
export class SharedIn {
    apiClient;
    /**
     * Creates an instance of SharedIn.
     * @date 2/1/2024 - 4:04:08 PM
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
     * Fetch files and folder shared to the user based on the parent UUID.
     * @date 2/1/2024 - 4:25:28 PM
     *
     * @public
     * @async
     * @param {?{ uuid?: string }} [params]
     * @returns {Promise<SharedInResponse>}
     */
    async fetch(params) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/shared/in",
            data: {
                uuid: params ? params.uuid : "shared-in"
            }
        });
        return response;
    }
}
export default SharedIn;
//# sourceMappingURL=in.js.map