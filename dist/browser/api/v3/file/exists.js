import { hashFn } from "../../../crypto/utils";
/**
 * FileExists
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileExists
 * @typedef {FileExists}
 */
export class FileExists {
    apiClient;
    /**
     * Creates an instance of FileExists.
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
     * Check if a directory already exists.
     * @date 2/9/2024 - 4:44:34 AM
     *
     * @public
     * @async
     * @param {{
     *         name: string
     *         parent: string
     *     }} param0
     * @param {string} param0.name
     * @param {string} param0.parent
     * @returns {Promise<DirExistsResponse>}
     */
    async fetch({ name, parent }) {
        const response = await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/file/exists",
            data: {
                parent,
                nameHashed: await hashFn({ input: name.toLowerCase() })
            }
        });
        return response;
    }
}
export default FileExists;
//# sourceMappingURL=exists.js.map