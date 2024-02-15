import type APIClient from "../../client";
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
    /**
     * Creates an instance of DirCreate.
     * @date 2/14/2024 - 4:35:07 AM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient; }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }: {
        apiClient: APIClient;
    });
    /**
     * Create a new folder.
     * @date 2/14/2024 - 4:35:02 AM
     *
     * @public
     * @async
     * @param {{ uuid?: string; metadataEncrypted: string; parent: string, nameHashed: string }} param0
     * @param {string} param0.uuid
     * @param {string} param0.metadataEncrypted
     * @param {string} param0.parent
     * @param {string} param0.nameHashed
     * @returns {Promise<DirCreateResponse>}
     */
    fetch({ uuid, metadataEncrypted, parent, nameHashed }: {
        uuid?: string;
        metadataEncrypted: string;
        parent: string;
        nameHashed: string;
    }): Promise<DirCreateResponse>;
}
export default DirCreate;
