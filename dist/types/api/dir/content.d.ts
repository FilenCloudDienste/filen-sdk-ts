import type APIClient from "../client";
import type { FileEncryptionVersion } from "../../types";
export type DirContentUpload = {
    uuid: string;
    metadata: string;
    rm: string;
    timestamp: number;
    chunks: number;
    size: number;
    bucket: string;
    region: string;
    parent: string;
    version: FileEncryptionVersion;
    favorited: 0 | 1;
};
export type DirContentFolder = {
    uuid: string;
    name: string;
    parent: string;
    color: string | null;
    timestamp: number;
    favorited: 0 | 1;
    is_sync: 0 | 1;
    is_default: 0 | 1;
};
export type DirContentResponse = {
    uploads: DirContentUpload[];
    folders: DirContentFolder[];
};
export default class DirContent {
    private readonly apiClient;
    constructor({ apiClient }: {
        apiClient: APIClient;
    });
    get({ uuid }: {
        uuid: string;
    }): Promise<DirContentResponse>;
}
