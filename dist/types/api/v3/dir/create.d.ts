import type APIClient from "../../client";
import type Crypto from "../../../crypto";
export type DirCreateResponse = {
    uuid: string;
};
/**
 * DirCreate
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirCreate
 * @typedef {DirCreate}
 */
export declare class DirCreate {
    private readonly apiClient;
    private readonly crypto;
    /**
     * Creates an instance of DirCreate.
     * @date 2/9/2024 - 4:56:44 AM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient; crypto: Crypto }} param0
     * @param {APIClient} param0.apiClient
     * @param {Crypto} param0.crypto
     */
    constructor({ apiClient, crypto }: {
        apiClient: APIClient;
        crypto: Crypto;
    });
    /**
     * Create a new folder.
     * @date 2/9/2024 - 4:54:57 AM
     *
     * @public
     * @async
     * @param {{ uuid?: string, name: string; parent: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.name
     * @param {string} param0.parent
     * @returns {Promise<DirCreateResponse>}
     */
    fetch({ uuid, name, parent }: {
        uuid?: string;
        name: string;
        parent: string;
    }): Promise<DirCreateResponse>;
}
export default DirCreate;
