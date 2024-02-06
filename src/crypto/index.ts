import Encrypt from "./encrypt"
import Decrypt from "./decrypt"
import utils from "./utils"

export type CryptoConfig = {
	masterKeys: string[]
	publicKey: string
	privateKey: string
	metadataCache: boolean
	tmpPath: string
}

/**
 * Crypto
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class Crypto
 * @typedef {Crypto}
 */
export class Crypto {
	private readonly config: CryptoConfig
	private readonly _encrypt: Encrypt
	private readonly _decrypt: Decrypt

	/**
	 * Creates an instance of Crypto.
	 * @date 1/31/2024 - 4:30:23 PM
	 *
	 * @constructor
	 * @public
	 * @param {CryptoConfig} params
	 */
	public constructor(params: CryptoConfig) {
		this.config = params
		this._encrypt = new Encrypt(this.config)
		this._decrypt = new Decrypt(this.config)
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
