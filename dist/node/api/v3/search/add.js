"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchAdd = void 0;
/**
 * SearchAdd
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class SearchAdd
 * @typedef {SearchAdd}
 */
class SearchAdd {
    /**
     * Creates an instance of SearchAdd.
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
     * Add items to the search index.
     * @date 2/13/2024 - 5:54:05 AM
     *
     * @public
     * @async
     * @returns {Promise<SearchAddResponse>}
     */
    async fetch({ items }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/search/add",
            data: {
                items
            }
        });
        return response;
    }
}
exports.SearchAdd = SearchAdd;
exports.default = SearchAdd;
//# sourceMappingURL=add.js.map