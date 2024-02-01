import type APIClient from "../../client";
export type DirSharedLink = {
    linkUUID: string;
    linkKey: string;
};
export type DirLinkedResponse = {
    link: boolean;
    links: DirSharedLink[];
};
/**
 * DirLinked
 * @date 2/1/2024 - 8:21:05 PM
 *
 * @export
 * @class DirLinked
 * @typedef {DirLinked}
 */
export declare class DirLinked {
    private readonly apiClient;
    /**
     * Creates an instance of DirLinked.
     * @date 2/1/2024 - 8:21:11 PM
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
     * Returns public link information about a directory.
     * @date 2/1/2024 - 8:21:37 PM
     *
     * @public
     * @async
     * @param {{ uuid: string }} param0
     * @param {string} param0.uuid
     * @returns {Promise<DirLinkedResponse>}
     */
    fetch({ uuid }: {
        uuid: string;
    }): Promise<DirLinkedResponse>;
}
export default DirLinked;
