/**
 * SearchFind
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class SearchFind
 * @typedef {SearchFind}
 */
export class SearchFind {
    apiClient;
    /**
     * Creates an instance of SearchFind.
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
     * Find items in the search index.
     * @date 2/13/2024 - 5:54:05 AM
     *
     * @public
     * @async
     * @returns {Promise<SearchFindResponse>}
     */
    async fetch({ hashes }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/search/find",
            data: {
                hashes
            }
        });
        return response;
    }
}
export default SearchFind;
//# sourceMappingURL=find.js.map