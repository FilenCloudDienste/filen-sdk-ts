import { type FileMetadata, type FolderMetadata } from "./types"

const cache = {
	fileMetadata: new Map<string, FileMetadata>(),
	folderMetadata: new Map<string, FolderMetadata>(),
	importPublicKey: new Map<string, CryptoKey>(),
	importPrivateKey: new Map<string, CryptoKey>(),
	chatKeyParticipant: new Map<string, string>(),
	chatKeyOwner: new Map<string, string>(),
	noteKeyOwner: new Map<string, string>(),
	noteKeyParticipant: new Map<string, string>(),
	noteTitle: new Map<string, string>(),
	notePreview: new Map<string, string>(),
	noteTagName: new Map<string, string>(),
	chatConversationName: new Map<string, string>(),
	folderLinkKey: new Map<string, string>(),
	importRawKey: new Map<string, CryptoKey>(),
	importPBKDF2Key: new Map<string, CryptoKey>()
}

export default cache
