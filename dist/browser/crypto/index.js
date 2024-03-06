import Encrypt from "./encrypt";
import Decrypt from "./decrypt";
import utils from "./utils";
/**
 * Crypto
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class Crypto
 * @typedef {Crypto}
 */
export class Crypto {
    config;
    _encrypt;
    _decrypt;
    /**
     * Creates an instance of Crypto.
     * @date 1/31/2024 - 4:30:23 PM
     *
     * @constructor
     * @public
     * @param {CryptoConfig} params
     */
    constructor(params) {
        this.config = params;
        this._encrypt = new Encrypt(this.config);
        this._decrypt = new Decrypt(this.config);
    }
    /**
     * Returns an Encrypt instance.
     * @date 1/31/2024 - 4:30:26 PM
     *
     * @public
     * @returns {Encrypt}
     */
    encrypt() {
        return this._encrypt;
    }
    /**
     * Returns a Decrypt instance.
     * @date 1/31/2024 - 4:30:44 PM
     *
     * @public
     * @returns {Decrypt}
     */
    decrypt() {
        return this._decrypt;
    }
    utils = utils;
}
export default Crypto;
//# sourceMappingURL=index.js.map