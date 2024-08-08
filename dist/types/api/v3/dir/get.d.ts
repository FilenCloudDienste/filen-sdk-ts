import type APIClient from "../../client";
export type DirGetResponse = {
    uuid: string;
    nameEncrypted: string;
    nameHashed: string;
    parent: string;
    trash: boolean;
    favorited: boolean;
    color: string | null;
};
/**
 * DirGet
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirGet
 * @typedef {DirGet}
 */
export declare class DirGet {
    private readonly apiClient;
    /**
     * Creates an instance of DirGet.
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
     * Get dir info.
     *
     * @public
     * @async
     * @param {{ uuid: string; }} param0
     * @param {string} param0.uuid
     * @returns {Promise<DirGetResponse>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<DirGetResponse>;
}
export default DirGet;
