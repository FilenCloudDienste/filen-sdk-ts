import type APIClient from "../../client";
import type Crypto from "../../../crypto";
/**
 * DirRename
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirRename
 * @typedef {DirRename}
 */
export declare class DirRename {
    private readonly apiClient;
    private readonly crypto;
    /**
     * Creates an instance of DirRename.
     * @date 2/9/2024 - 5:10:15 AM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient, crypto: Crypto }} param0
     * @param {APIClient} param0.apiClient
     * @param {Crypto} param0.crypto
     */
    constructor({ apiClient, crypto }: {
        apiClient: APIClient;
        crypto: Crypto;
    });
    /**
     * Rename a directory.
     * @date 2/9/2024 - 5:16:43 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; name: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.name
     * @returns {Promise<void>}
     */
    fetch({ uuid, name }: {
        uuid: string;
        name: string;
    }): Promise<void>;
}
export default DirRename;
