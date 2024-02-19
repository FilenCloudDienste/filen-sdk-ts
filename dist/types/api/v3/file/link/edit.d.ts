import type APIClient from "../../../client";
import type { PublicLinkExpiration } from "../../../../types";
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
     * @date 2/19/2024 - 4:45:17 AM
     *
     * @public
     * @async
     * @param {{
     * 		uuid: string
     * 		fileUUID: string
     * 		expiration: PublicLinkExpiration
     * 		password: string
     * 		passwordHashed: string
     * 		downloadBtn: boolean
     * 		type: "enable" | "disable"
     * 		salt: string
     * 	}} param0
     * @param {string} param0.uuid
     * @param {string} param0.fileUUID
     * @param {PublicLinkExpiration} [param0.expiration="never"]
     * @param {string} param0.password
     * @param {boolean} [param0.downloadBtn=true]
     * @param {("enable" | "disable")} param0.type
     * @param {string} param0.passwordHashed
     * @param {string} param0.salt
     * @returns {Promise<void>}
     */
    fetch({ uuid, fileUUID, expiration, password, downloadBtn, type, passwordHashed, salt }: {
        uuid: string;
        fileUUID: string;
        expiration: PublicLinkExpiration;
        password: string;
        passwordHashed: string;
        downloadBtn: boolean;
        type: "enable" | "disable";
        salt: string;
    }): Promise<void>;
}
export default FileLinkEdit;
