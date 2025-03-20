import type APIClient from "../../client";
/**
 * FileMetadata
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileMetadata
 * @typedef {FileMetadata}
 */
export declare class FileMetadata {
    private readonly apiClient;
    /**
     * Creates an instance of FileMetadata.
     * @date 2/14/2024 - 4:40:52 AM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient; }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }: {
        apiClient: APIClient;
    });
    /**
     * Change file metadata.
     * @date 2/14/2024 - 4:40:39 AM
     *
     * @public
     * @async
     * @param {{ uuid: string; metadataEncrypted: string; nameEncrypted: string, nameHashed: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.metadataEncrypted
     * @param {string} param0.nameEncrypted
     * @param {string} param0.nameHashed
     * @returns {Promise<void>}
     */
    fetch({ uuid, metadataEncrypted, nameEncrypted, nameHashed }: {
        uuid: string;
        metadataEncrypted: string;
        nameEncrypted: string;
        nameHashed: string;
    }): Promise<void>;
}
export default FileMetadata;
