import type { CryptoConfig } from ".";
import type { FileMetadata, FolderMetadata } from "../types";
/**
 * Decrypt
 * @date 1/31/2024 - 6:36:57 PM
 *
 * @export
 * @class Decrypt
 * @typedef {Decrypt}
 */
export declare class Decrypt {
    private readonly config;
    private readonly textEncoder;
    private readonly textDecoder;
    /**
     * Creates an instance of Decrypt.
     * @date 1/31/2024 - 3:59:10 PM
     *
     * @constructor
     * @public
     * @param {CryptoConfig} params
     */
    constructor(params: CryptoConfig);
    /**
     * Decrypt a string with the given key.
     * @date 1/31/2024 - 3:58:27 PM
     *
     * @public
     * @async
     * @param {{ data: string; key: string }} param0
     * @param {string} param0.data
     * @param {string} param0.key
     * @returns {Promise<string>}
     */
    metadata({ metadata, key }: {
        metadata: string;
        key: string;
    }): Promise<string>;
    /**
     * Decrypt file metadata.
     * @date 1/31/2024 - 4:20:32 PM
     *
     * @public
     * @async
     * @param {{ metadata: string }} param0
     * @param {string} param0.metadata
     * @returns {Promise<FileMetadata>}
     */
    fileMetadata({ metadata }: {
        metadata: string;
    }): Promise<FileMetadata>;
    /**
     * Decrypt folder metadata.
     * @date 1/31/2024 - 4:26:11 PM
     *
     * @public
     * @async
     * @param {{ metadata: string }} param0
     * @param {string} param0.metadata
     * @returns {Promise<FolderMetadata>}
     */
    folderMetadata({ metadata }: {
        metadata: string;
    }): Promise<FolderMetadata>;
}
export default Decrypt;
