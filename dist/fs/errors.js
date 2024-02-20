"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENOENT = void 0;
/**
 * FileNotFoundError
 * @date 2/9/2024 - 6:49:57 AM
 *
 * @export
 * @class FileNotFoundError
 * @typedef {FileNotFoundError}
 * @extends {Error}
 */
class ENOENT extends Error {
    /**
     * Creates an instance of ENOENT.
     * @date 2/9/2024 - 6:51:15 AM
     *
     * @constructor
     * @public
     * @param {{path: string}} param0
     * @param {string} param0.path
     */
    constructor({ path }) {
        super(`ENOENT: no such file or directory, open '${path}'`);
        this.name = "FileNotFoundError";
        this.code = "ENOENT";
        this.errno = -2;
        this.syscall = "open";
        this.path = path;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ENOENT);
        }
    }
}
exports.ENOENT = ENOENT;
//# sourceMappingURL=errors.js.map