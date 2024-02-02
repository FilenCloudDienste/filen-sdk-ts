import type { CryptoConfig } from ".";
/**
 * Encrypt
 * @date 2/1/2024 - 2:44:28 AM
 *
 * @export
 * @class Encrypt
 * @typedef {Encrypt}
 */
export declare class Encrypt {
    private readonly config;
    private readonly textEncoder;
    private readonly textDecoder;
    /**
     * Creates an instance of Encrypt.
     * @date 1/31/2024 - 3:59:21 PM
     *
     * @constructor
     * @public
     * @param {CryptoConfig} params
     */
    constructor(params: CryptoConfig);
    /**
     * Encrypt a string using the user's last master key.
     * @date 1/31/2024 - 3:59:29 PM
     *
     * @public
     * @async
     * @param {{ data: string }} param0
     * @param {string} param0.data
     * @returns {Promise<string>}
     */
    metadata({ metadata, key, derive }: {
        metadata: string;
        key?: string;
        derive?: boolean;
    }): Promise<string>;
}
export default Encrypt;
