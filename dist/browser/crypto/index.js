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
    sdk;
    _encrypt;
    _decrypt;
    constructor(sdk) {
        this.sdk = sdk;
        this._encrypt = new Encrypt(this.sdk);
        this._decrypt = new Decrypt(this.sdk);
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