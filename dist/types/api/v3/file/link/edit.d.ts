import type APIClient from "../../../client";
export type FileLinkEditExpiration = "30d" | "14d" | "7d" | "3d" | "1d" | "6h" | "1h" | "never";
/**
 * FileLinkEdit
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class FileLinkEdit
 * @typedef {FileLinkEdit}
 */
export declare class FileLinkEdit {
    private readonly apiClient;
    /**
     * Creates an instance of FileLinkEdit.
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
     * Enable/disable/edit a file's public link.
     * @date 2/10/2024 - 1:08:07 AM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		fileUUID: string
     * 		expiration?: FileLinkEditExpiration
     * 		password?: string
     * 		downloadBtn?: boolean
     * 		type: "enable" | "disable" | "edit"
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.fileUUID
     * @param {FileLinkEditExpiration} [param0.expiration="never"]
     * @param {string} param0.password
     * @param {boolean} [param0.downloadBtn=true]
     * @param {("enable" | "disable" | "edit")} param0.type
     * @returns {Promise<void>}
     */
    fetch({ uuid, fileUUID, expiration, password, downloadBtn, type }: {
        uuid: string;
        fileUUID: string;
        expiration?: FileLinkEditExpiration;
        password?: string;
        downloadBtn?: boolean;
        type: "enable" | "disable" | "edit";
    }): Promise<void>;
}
export default FileLinkEdit;
