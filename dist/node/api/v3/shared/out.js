"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedOut = void 0;
/**
 * SharedOut
 * @date 2/1/2024 - 4:19:58 PM
 *
 * @export
 * @class SharedOut
 * @typedef {SharedOut}
 */
class SharedOut {
    /**
     * Creates an instance of SharedOut.
     * @date 2/1/2024 - 4:20:03 PM
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
     * Fetch shared files and folders based on the given UUID and receiverId.
     * @date 2/1/2024 - 4:26:07 PM
     *
     * @public
     * @async
     * @param {?{ uuid?: string; receiverId?: number }} [params]
     * @returns {Promise<SharedOutResponse>}
     */
    async fetch(params) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/shared/out",
            data: {
                uuid: params ? params.uuid : "shared-out",
                receiverId: params ? params.receiverId : 0
            }
        });
        return response;
    }
}
exports.SharedOut = SharedOut;
exports.default = SharedOut;
//# sourceMappingURL=out.js.map