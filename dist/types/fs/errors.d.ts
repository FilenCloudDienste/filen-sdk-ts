/**
 * FileNotFoundError
 * @date 2/9/2024 - 6:49:57 AM
 *
 * @export
 * @class FileNotFoundError
 * @typedef {FileNotFoundError}
 * @extends {Error}
 */
export declare class ENOENT extends Error {
    errno: number;
    syscall: string;
    path: string;
    code: string;
    /**
     * Creates an instance of ENOENT.
     * @date 2/9/2024 - 6:51:15 AM
     *
     * @constructor
     * @public
     * @param {{path: string}} param0
     * @param {string} param0.path
     */
    constructor({ path }: {
        path: string;
    });
}
