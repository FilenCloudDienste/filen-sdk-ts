import { type FileGetResponse } from "./api/v3/file/get";
import { type DirGetResponse } from "./api/v3/dir/get";
export type AuthVersion = 1 | 2;
export type FileEncryptionVersion = 1 | 2;
export type Environment = "node" | "browser";
export type FileMetadata = {
    name: string;
    size: number;
    mime: string;
    key: string;
    lastModified: number;
    creation?: number;
    hash?: string;
};
export type FolderMetadata = {
    name: string;
};
export type ProgressCallback = (transferred: number, id?: string) => void;
export type PublicLinkExpiration = "30d" | "14d" | "7d" | "3d" | "1d" | "6h" | "1h" | "never";
export type ProgressWithTotalCallback = (transferred: number, total: number) => void;
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
export type GetFileResult = FileGetResponse & {
    metadataDecrypted: FileMetadata;
    chunks: number;
};
export type GetDirResult = DirGetResponse & {
    metadataDecrypted: FolderMetadata;
};
export type ClassMethodNames<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];
export type ClassMethods<T> = Pick<T, ClassMethodNames<T>>;
