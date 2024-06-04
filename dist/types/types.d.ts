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
export type ProgressCallback = (transferred: number) => void;
export type PublicLinkExpiration = "30d" | "14d" | "7d" | "3d" | "1d" | "6h" | "1h" | "never";
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
