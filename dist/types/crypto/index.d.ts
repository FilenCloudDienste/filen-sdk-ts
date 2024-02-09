import Encrypt from "./encrypt";
import Decrypt from "./decrypt";
export type CryptoConfig = {
    masterKeys: string[];
    publicKey: string;
    privateKey: string;
    metadataCache: boolean;
    tmpPath: string;
};
/**
 * Crypto
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class Crypto
 * @typedef {Crypto}
 */
export declare class Crypto {
    private readonly config;
    private readonly _encrypt;
    private readonly _decrypt;
    /**
     * Creates an instance of Crypto.
     * @date 1/31/2024 - 4:30:23 PM
     *
     * @constructor
     * @public
     * @param {CryptoConfig} params
     */
    constructor(params: CryptoConfig);
    /**
     * Returns an Encrypt instance.
     * @date 1/31/2024 - 4:30:26 PM
     *
     * @public
     * @returns {Encrypt}
     */
    encrypt(): Encrypt;
    /**
     * Returns a Decrypt instance.
     * @date 1/31/2024 - 4:30:44 PM
     *
     * @public
     * @returns {Decrypt}
     */
    decrypt(): Decrypt;
    readonly utils: {
        generateRandomString: typeof import("./utils").generateRandomString;
        deriveKeyFromPassword: typeof import("./utils").deriveKeyFromPassword;
        hashFn: typeof import("./utils").hashFn;
        generatePasswordAndMasterKeyBasedOnAuthVersion: typeof import("./utils").generatePasswordAndMasterKeyBasedOnAuthVersion;
        hashPassword: typeof import("./utils").hashPassword;
        derKeyToPem: typeof import("./utils").derKeyToPem;
        importPublicKey: typeof import("./utils").importPublicKey;
        importPrivateKey: typeof import("./utils").importPrivateKey;
        bufferToHash: typeof import("./utils").bufferToHash;
        generateKeyPair: typeof import("./utils").generateKeyPair;
        importRawKey: typeof import("./utils").importRawKey;
        importPBKDF2Key: typeof import("./utils").importPBKDF2Key;
    };
}
export default Crypto;
