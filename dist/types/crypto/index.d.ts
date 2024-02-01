import Encrypt from "./encrypt";
import Decrypt from "./decrypt";
export type CryptoConfig = {
    masterKeys: string[];
    publicKey: string;
    privateKey: string;
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
        bufferToBase64: typeof import("./utils").bufferToBase64;
        bufferToHex: typeof import("./utils").bufferToHex;
        deriveKeyFromPassword: typeof import("./utils").deriveKeyFromPassword;
        base64ToBuffer: typeof import("./utils").base64ToBuffer;
    };
}
export default Crypto;
