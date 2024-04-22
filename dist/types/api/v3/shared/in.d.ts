import type APIClient from "../../client";
import { FileEncryptionVersion } from "../../../types";
import type { DirColors } from "../dir/color";
export type SharedInUpload = {
    uuid: string;
    parent: string;
    metadata: string;
    type: "file";
    bucket: string;
    region: string;
    chunks: number;
    size: number;
    version: FileEncryptionVersion;
    sharerEmail: string;
    sharerId: number;
    receiverEmail: null | string;
    receiverId: null | number;
    writeAccess: 0 | 1;
    timestamp: number;
};
export type SharedInFolder = {
    uuid: string;
    parent: string | null;
    metadata: string;
    type: "folder";
    bucket: null;
    region: null;
    chunks: null;
    sharerEmail: string;
    sharerId: number;
    receiverEmail: null | string;
    receiverId: null | number;
    writeAccess: 0 | 1;
    color: DirColors | null;
    timestamp: number;
    is_sync: 0 | 1;
    is_default: 0 | 1;
};
export type SharedInResponse = {
    uploads: SharedInUpload[];
    folders: SharedInFolder[];
};
/**
 * SharedIn
 * @date 2/1/2024 - 4:04:02 PM
 *
 * @export
 * @class SharedIn
 * @typedef {SharedIn}
 */
export declare class SharedIn {
    private readonly apiClient;
    /**
     * Creates an instance of SharedIn.
     * @date 2/1/2024 - 4:04:08 PM
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
     * Fetch files and folder shared to the user based on the parent UUID.
     * @date 2/1/2024 - 4:25:28 PM
     *
     * @public
     * @async
     * @param {?{ uuid?: string }} [params]
     * @returns {Promise<SharedInResponse>}
     */
    fetch(params?: {
        uuid?: string;
    }): Promise<SharedInResponse>;
}
export default SharedIn;
