import type APIClient from "../../client";
import type Crypto from "../../../crypto";
import type { FileMetadata } from "../../../types";
/**
 * FileRename
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileRename
 * @typedef {FileRename}
 */
export declare class FileRename {
    private readonly apiClient;
    private readonly crypto;
    /**
     * Creates an instance of FileRename.
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
     * Rename a file.
     * @date 2/9/2024 - 5:16:16 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; metadata: FileMetadata; name: string }} param0
     * @param {string} param0.uuid
     * @param {FileMetadata} param0.metadata
     * @param {string} param0.name
     * @returns {Promise<void>}
     */
    fetch({ uuid, metadata, name }: {
        uuid: string;
        metadata: FileMetadata;
        name: string;
    }): Promise<void>;
}
export default FileRename;
