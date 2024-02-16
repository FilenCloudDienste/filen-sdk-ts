/**
 * APIError
 * @date 2/9/2024 - 6:49:57 AM
 *
 * @export
 * @class APIError
 * @typedef {APIError}
 * @extends {Error}
 */
export declare class APIError extends Error {
    code: string;
    message: string;
    name: string;
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
    constructor({ code, message }: {
        code: string;
        message: string;
    });
}
