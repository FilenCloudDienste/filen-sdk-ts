/**
 * DirTree
 * @date 2/1/2024 - 6:04:48 PM
 *
 * @export
 * @class DirTree
 * @typedef {DirTree}
 */
export class DirTree {
    apiClient;
    /**
     * Creates an instance of DirTree.
     * @date 2/1/2024 - 6:04:54 PM
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
     * Fetch the dir tree used for syncing.
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		deviceId: string
     * 		skipCache?: boolean
     * 		includeRaw?: boolean
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.deviceId
     * @param {boolean} [param0.skipCache=false]
     * @param {boolean} [param0.includeRaw=false]
     * @returns {Promise<DirTreeResponse>}
     */
    async fetch({ uuid, deviceId, skipCache = false, includeRaw = false }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/dir/tree",
            data: {
                uuid,
                deviceId,
                skipCache: skipCache ? 1 : 0
            },
            includeRaw
        });
        return response;
    }
}
export default DirTree;
//# sourceMappingURL=tree.js.map