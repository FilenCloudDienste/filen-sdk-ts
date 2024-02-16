/**
 * APIError
 * @date 2/9/2024 - 6:49:57 AM
 *
 * @export
 * @class APIError
 * @typedef {APIError}
 * @extends {Error}
 */
export class APIError extends Error {
	public code: string
	public message: string
	public name: string

	/**
	 * Creates an instance of APIError.
	 * @date 2/16/2024 - 5:19:35 AM
	 *
	 * @constructor
	 * @public
	 * @param {{ code: string, message: string }} param0
	 * @param {string} param0.code
	 * @param {string} param0.message
	 */
	public constructor({ code, message }: { code: string; message: string }) {
		super(message)

		this.name = "APIError"
		this.code = code
		this.message = message

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, APIError)
		}
	}
}
