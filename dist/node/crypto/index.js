"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crypto = void 0;
const encrypt_1 = __importDefault(require("./encrypt"));
const decrypt_1 = __importDefault(require("./decrypt"));
const utils_1 = __importDefault(require("./utils"));
/**
 * Crypto
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class Crypto
 * @typedef {Crypto}
 */
class Crypto {
    /**
     * Creates an instance of Crypto.
     * @date 1/31/2024 - 4:30:23 PM
     *
     * @constructor
     * @public
     * @param {CryptoConfig} params
     */
    constructor(params) {
        this.utils = utils_1.default;
        this.config = params;
        this._encrypt = new encrypt_1.default(this.config);
        this._decrypt = new decrypt_1.default(this.config);
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
}
exports.Crypto = Crypto;
exports.default = Crypto;
//# sourceMappingURL=index.js.map