export type AuthVersion = 1 | 2;
export type FileEncryptionVersion = 1 | 2;
export type FileMetadata = {
    name: string;
    size: number;
    mime: string;
    key: string;
    lastModified: number;
    creation?: number;
    hash?: number;
};
export type FolderMetadata = {
    name: string;
};
