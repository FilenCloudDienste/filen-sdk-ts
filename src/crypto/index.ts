import Encrypt from "./encrypt"
import Decrypt from "./decrypt"
import utils from "./utils"
import type FilenSDK from ".."

/**
 * Crypto
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class Crypto
 * @typedef {Crypto}
 */
export class Crypto {
	private readonly sdk: FilenSDK
	private readonly _encrypt: Encrypt
	private readonly _decrypt: Decrypt

	public constructor(sdk: FilenSDK) {
		this.sdk = sdk
		this._encrypt = new Encrypt(this.sdk)
		this._decrypt = new Decrypt(this.sdk)
	}

	/**
	 * Returns an Encrypt instance.
	 * @date 1/31/2024 - 4:30:26 PM
	 *
	 * @public
	 * @returns {Encrypt}
	 */
	public encrypt(): Encrypt {
		return this._encrypt
	}

	/**
	 * Returns a Decrypt instance.
	 * @date 1/31/2024 - 4:30:44 PM
	 *
	 * @public
	 * @returns {Decrypt}
	 */
	public decrypt(): Decrypt {
		return this._decrypt
	}

	public readonly utils = utils
}

export default Crypto
