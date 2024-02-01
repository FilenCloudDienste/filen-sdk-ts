import type APIClient from "../../client";
export type DirSharedUser = {
    email: string;
    publicKey: string;
};
export type DirSharedResponse = {
    sharing: boolean;
    users: DirSharedUser[];
};
/**
 * DirShared
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirShared
 * @typedef {DirShared}
 */
export declare class DirShared {
    private readonly apiClient;
    /**
     * Creates an instance of DirShared.
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
     * Returns sharing information about a directory.
     * @date 2/1/2024 - 8:16:46 PM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 	}} param0
     * @param {string} param0.uuid
     * @returns {Promise<DirSharedResponse>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<DirSharedResponse>;
}
export default DirShared;
