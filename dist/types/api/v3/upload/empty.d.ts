import type APIClient from "../../client";
import { type FileEncryptionVersion } from "../../../types";
export type UploadEmptyResponse = {
    chunks: number;
    size: number;
};
/**
 * UploadEmpty
 * @date 2/1/2024 - 4:45:26 PM
 *
 * @export
 * @class UploadEmpty
 * @typedef {UploadEmpty}
 */
export declare class UploadEmpty {
    private readonly apiClient;
    /**
     * Creates an instance of UploadEmpty.
     * @date 2/1/2024 - 4:45:31 PM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }: {
        apiClient: APIClient;
    });
    fetch({ uuid, name, nameHashed, size, parent, mime, metadata, version }: {
        uuid: string;
        name: string;
        nameHashed: string;
        size: string;
        parent: string;
        mime: string;
        metadata: string;
        version: FileEncryptionVersion;
    }): Promise<UploadEmptyResponse>;
}
export default UploadEmpty;
