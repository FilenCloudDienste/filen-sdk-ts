import type APIClient from "../../client";
export type DirSizeLinkResponse = {
    size: number;
    folders: number;
    files: number;
};
/**
 * DirSizeLink
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirSizeLink
 * @typedef {DirSizeLink}
 */
export declare class DirSizeLink {
    private readonly apiClient;
    /**
     * Creates an instance of DirSizeLink.
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
     * Get the size of a directory inside a public link.
     * @date 2/9/2024 - 5:36:04 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; linkUUID: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.linkUUID
     * @returns {Promise<DirSizeLinkResponse>}
     */
    fetch({ uuid, linkUUID }: {
        uuid: string;
        linkUUID: string;
    }): Promise<DirSizeLinkResponse>;
}
export default DirSizeLink;
