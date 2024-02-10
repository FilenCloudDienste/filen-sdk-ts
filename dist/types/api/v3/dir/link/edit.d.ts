import type APIClient from "../../../client";
export type DirLinkEditExpiration = "30d" | "14d" | "7d" | "3d" | "1d" | "6h" | "1h" | "never";
/**
 * DirLinkEdit
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class DirLinkEdit
 * @typedef {DirLinkEdit}
 */
export declare class DirLinkEdit {
    private readonly apiClient;
    /**
     * Creates an instance of DirLinkEdit.
     * @date 2/1/2024 - 8:16:39 PM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }: {
        apiClient: APIClient;
    });
    /**
     * Edit a directory public link.
     * @date 2/10/2024 - 1:14:26 AM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		expiration?: DirLinkEditExpiration
     * 		password?: string
     * 		downloadBtn?: boolean
     * 	}} param0
     * @param {string} param0.uuid
     * @param {DirLinkEditExpiration} [param0.expiration="never"]
     * @param {string} param0.password
     * @param {boolean} [param0.downloadBtn=true]
     * @returns {Promise<void>}
     */
    fetch({ uuid, expiration, password, downloadBtn }: {
        uuid: string;
        expiration?: DirLinkEditExpiration;
        password?: string;
        downloadBtn?: boolean;
    }): Promise<void>;
}
export default DirLinkEdit;
