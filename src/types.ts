export type AuthVersion = 1 | 2
export type FileEncryptionVersion = 1 | 2
export type Environment = "node" | "reactNative" | "browser"

export type FileMetadata = {
	name: string
	size: number
	mime: string
	key: string
	lastModified: number
	creation?: number
	hash?: string
}

export type FolderMetadata = {
	name: string
}

export type ProgressCallback = (transferred: number) => void
