import Encrypt from "./encrypt";
import Decrypt from "./decrypt";
import type FilenSDK from "..";
/**
 * Crypto
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class Crypto
 * @typedef {Crypto}
 */
export declare class Crypto {
    private readonly sdk;
    private readonly _encrypt;
    private readonly _decrypt;
    constructor(sdk: FilenSDK);
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
        generateRandomBytes: typeof import("./utils").generateRandomBytes;
        generateRandomURLSafeString: typeof import("./utils").generateRandomURLSafeString;
        generateRandomHexString: typeof import("./utils").generateRandomHexString;
        hashFileName: typeof import("./utils").hashFileName;
        hashSearchIndex: typeof import("./utils").hashSearchIndex;
        generateSearchIndexHashes: typeof import("./utils").generateSearchIndexHashes;
        generatePrivateKeyHMAC: typeof import("./utils").generatePrivateKeyHMAC;
        generateEncryptionKey: typeof import("./utils").generateEncryptionKey;
    };
}
export default Crypto;
