"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIError = void 0;
/**
 * APIError
 * @date 2/9/2024 - 6:49:57 AM
 *
 * @export
 * @class APIError
 * @typedef {APIError}
 * @extends {Error}
 */
class APIError extends Error {
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
    constructor({ code, message }) {
        super(message);
        this.name = "APIError";
        this.code = code;
        this.message = message;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, APIError);
        }
    }
}
exports.APIError = APIError;
//# sourceMappingURL=errors.js.map