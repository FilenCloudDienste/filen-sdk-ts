import type APIClient from "../../client";
import type { FileEncryptionVersion } from "../../../types";
export type DirTreeFile = [string, string, string, number, string, string, FileEncryptionVersion, number];
export type DirTreeFolder = [string, string, string];
export type DirTreeResponse = {
    files: DirTreeFile[];
    folders: DirTreeFolder[];
    raw: string;
};
/**
 * DirTree
 * @date 2/1/2024 - 6:04:48 PM
 *
 * @export
 * @class DirTree
 * @typedef {DirTree}
 */
export declare class DirTree {
    private readonly apiClient;
    /**
     * Creates an instance of DirTree.
     * @date 2/1/2024 - 6:04:54 PM
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
    fetch({ uuid, deviceId, skipCache, includeRaw }: {
        uuid: string;
        deviceId: string;
        skipCache?: boolean;
        includeRaw?: boolean;
    }): Promise<DirTreeResponse>;
}
export default DirTree;
