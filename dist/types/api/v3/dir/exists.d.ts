import type APIClient from "../../client";
export type DirExistsResponse = {
    exists: false;
    uuid?: string;
} | {
    exists: true;
    uuid: string;
};
/**
 * DirExists
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirExists
 * @typedef {DirExists}
 */
export declare class DirExists {
    private readonly apiClient;
    /**
     * Creates an instance of DirExists.
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
     * Check if a directory already exists.
     * @date 2/9/2024 - 4:44:34 AM
     *
     * @public
     * @async
     * @param {{
     *         nameHashed: string
     *         parent: string
     *     }} param0
     * @param {string} param0.nameHashed
     * @param {string} param0.parent
     * @returns {Promise<DirExistsResponse>}
     */
    fetch({ nameHashed, parent }: {
        nameHashed: string;
        parent: string;
    }): Promise<DirExistsResponse>;
}
export default DirExists;
