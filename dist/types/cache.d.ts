import type { FileMetadata, FolderMetadata } from "./types";
declare const cache: {
    fileMetadata: Map<string, FileMetadata>;
    folderMetadata: Map<string, FolderMetadata>;
    importPublicKey: Map<string, CryptoKey>;
    importPrivateKey: Map<string, CryptoKey>;
    chatKey: Map<string, string>;
    noteKeyOwner: Map<string, string>;
    noteKeyParticipant: Map<string, string>;
    noteTitle: Map<string, string>;
    notePreview: Map<string, string>;
    noteTagName: Map<string, string>;
    chatConversationName: Map<string, string>;
    folderLinkKey: Map<string, string>;
    importRawAESGCMKey: Map<string, CryptoKey>;
    importPBKDF2Key: Map<string, CryptoKey>;
};
export default cache;
