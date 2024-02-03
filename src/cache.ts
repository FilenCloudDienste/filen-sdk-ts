import type { FileMetadata, FolderMetadata } from "./types"

const cache = {
	fileMetadata: new Map<string, FileMetadata>(),
	folderMetadata: new Map<string, FolderMetadata>(),
	importPublicKey: new Map<string, CryptoKey>(),
	importPrivateKey: new Map<string, CryptoKey>()
}

export default cache
