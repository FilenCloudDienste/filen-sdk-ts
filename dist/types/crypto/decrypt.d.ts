/// <reference types="node" />
import type { CryptoConfig } from ".";
import type { FileMetadata, FolderMetadata, FileEncryptionVersion } from "../types";
import { type UserEvent } from "../api/v3/user/events";
/**
 * Decrypt
 * @date 1/31/2024 - 6:36:57 PM
 *
 * @export
 * @class Decrypt
 * @typedef {Decrypt}
 */
export declare class Decrypt {
    private readonly config;
    private readonly textDecoder;
    /**
     * Creates an instance of Decrypt.
     * @date 1/31/2024 - 3:59:10 PM
     *
     * @constructor
     * @public
     * @param {CryptoConfig} params
     */
    constructor(params: CryptoConfig);
    /**
     * Decrypt a string with the given key.
     * @date 1/31/2024 - 3:58:27 PM
     *
     * @public
     * @async
     * @param {{ data: string; key: string }} param0
     * @param {string} param0.data
     * @param {string} param0.key
     * @returns {Promise<string>}
     */
    metadata({ metadata, key }: {
        metadata: string;
        key: string;
    }): Promise<string>;
    /**
     * Decrypt metadata using the given private key.
     * @date 2/3/2024 - 1:50:10 AM
     *
     * @public
     * @async
     * @param {{ metadata: string; privateKey: string }} param0
     * @param {string} param0.metadata
     * @param {string} param0.privateKey
     * @returns {Promise<string>}
     */
    metadataPrivate({ metadata, privateKey }: {
        metadata: string;
        privateKey: string;
    }): Promise<string>;
    /**
     * Decrypt file metadata.
     * @date 2/3/2024 - 1:54:51 AM
     *
     * @public
     * @async
     * @param {{ metadata: string, key?: string }} param0
     * @param {string} param0.metadata
     * @param {string} param0.key
     * @returns {Promise<FileMetadata>}
     */
    fileMetadata({ metadata, key }: {
        metadata: string;
        key?: string;
    }): Promise<FileMetadata>;
    /**
     * Decrypt folder metadata.
     * @date 2/3/2024 - 1:55:17 AM
     *
     * @public
     * @async
     * @param {{ metadata: string, key?: string }} param0
     * @param {string} param0.metadata
     * @param {string} param0.key
     * @returns {Promise<FolderMetadata>}
     */
    folderMetadata({ metadata, key }: {
        metadata: string;
        key?: string;
    }): Promise<FolderMetadata>;
    /**
     * Decrypt file metadata using a private key.
     * @date 2/3/2024 - 1:58:12 AM
     *
     * @public
     * @async
     * @param {{ metadata: string; key?: string }} param0
     * @param {string} param0.metadata
     * @param {string} param0.key
     * @returns {Promise<FileMetadata>}
     */
    fileMetadataPrivate({ metadata, key }: {
        metadata: string;
        key?: string;
    }): Promise<FileMetadata>;
    /**
     * Decrypt folder metadata using a private key.
     * @date 2/3/2024 - 1:58:05 AM
     *
     * @public
     * @async
     * @param {{ metadata: string; key?: string }} param0
     * @param {string} param0.metadata
     * @param {string} param0.key
     * @returns {Promise<FolderMetadata>}
     */
    folderMetadataPrivate({ metadata, key }: {
        metadata: string;
        key?: string;
    }): Promise<FolderMetadata>;
    /**
     * Decrypt file metadata inside a public link.
     * @date 2/6/2024 - 3:05:42 AM
     *
     * @public
     * @async
     * @param {{ metadata: string; linkKey: string }} param0
     * @param {string} param0.metadata
     * @param {string} param0.linkKey
     * @returns {Promise<FileMetadata>}
     */
    fileMetadataLink({ metadata, linkKey }: {
        metadata: string;
        linkKey: string;
    }): Promise<FileMetadata>;
    /**
     * Decrypt folder metadata inside a public link.
     * @date 2/6/2024 - 3:07:06 AM
     *
     * @public
     * @async
     * @param {{ metadata: string; linkKey: string }} param0
     * @param {string} param0.metadata
     * @param {string} param0.linkKey
     * @returns {Promise<FolderMetadata>}
     */
    folderMetadataLink({ metadata, linkKey }: {
        metadata: string;
        linkKey: string;
    }): Promise<FolderMetadata>;
    /**
     * Decrypt a public link folder encryption key (using given key or master keys).
     * @date 2/6/2024 - 3:09:37 AM
     *
     * @public
     * @async
     * @param {{ metadata: string; key?: string }} param0
     * @param {string} param0.metadata
     * @param {string} param0.key
     * @returns {Promise<string>}
     */
    folderLinkKey({ metadata, key }: {
        metadata: string;
        key?: string;
    }): Promise<string>;
    /**
     * Decrypts a chat encryption (symmetric) key.
     * @date 2/6/2024 - 12:54:25 AM
     *
     * @public
     * @async
     * @param {{metadata: string, privateKey: string}} param0
     * @param {string} param0.metadata
     * @param {string} param0.privateKey
     * @returns {Promise<string>}
     */
    chatKeyParticipant({ metadata, privateKey }: {
        metadata: string;
        privateKey: string;
    }): Promise<string>;
    /**
     * Decrypts a chat encryption (symmetric) key.
     *
     * @public
     * @async
     * @param {{ metadata: string; key?: string }} param0
     * @param {string} param0.metadata
     * @param {string} param0.key
     * @returns {Promise<string>}
     */
    chatKeyOwner({ metadata, key }: {
        metadata: string;
        key?: string;
    }): Promise<string>;
    /**
     * Decrypt a chat message
     * @date 2/20/2024 - 5:34:42 AM
     *
     * @public
     * @async
     * @param {{
     * 		message: string
     * 		key: string
     * 	}} param0
     * @param {string} param0.message
     * @param {string} param0.key
     * @returns {Promise<string>}
     */
    chatMessage({ message, key }: {
        message: string;
        key: string;
    }): Promise<string>;
    /**
     * Decrypts the symmetric note encryption key with the given owner metadata.
     * @date 2/6/2024 - 1:01:59 AM
     *
     * @public
     * @async
     * @param {{ metadata: string; key?: string }} param0
     * @param {string} param0.metadata
     * @param {string} param0.key
     * @returns {Promise<string>}
     */
    noteKeyOwner({ metadata, key }: {
        metadata: string;
        key?: string;
    }): Promise<string>;
    /**
     * Decrypt a symmetric note encryption key using participant metadata and their private key.
     * @date 2/6/2024 - 2:47:34 AM
     *
     * @public
     * @async
     * @param {{metadata: string, privateKey: string}} param0
     * @param {string} param0.metadata
     * @param {string} param0.privateKey
     * @returns {Promise<string>}
     */
    noteKeyParticipant({ metadata, privateKey }: {
        metadata: string;
        privateKey: string;
    }): Promise<string>;
    /**
     * Decrypt note content using the note's symmetric encryption key.
     * @date 2/6/2024 - 2:50:15 AM
     *
     * @public
     * @async
     * @param {{content: string, key: string}} param0
     * @param {string} param0.content
     * @param {string} param0.key
     * @returns {Promise<string>}
     */
    noteContent({ content, key }: {
        content: string;
        key: string;
    }): Promise<string>;
    /**
     * Decrypt a note's title using the note's symmetric encryption key.
     * @date 2/6/2024 - 2:52:02 AM
     *
     * @public
     * @async
     * @param {{title: string, key: string}} param0
     * @param {string} param0.title
     * @param {string} param0.key
     * @returns {Promise<string>}
     */
    noteTitle({ title, key }: {
        title: string;
        key: string;
    }): Promise<string>;
    /**
     * Decrypt a note's preview using the note's symmetric encryption key.
     * @date 2/6/2024 - 2:53:35 AM
     *
     * @public
     * @async
     * @param {{ preview: string; key: string }} param0
     * @param {string} param0.preview
     * @param {string} param0.key
     * @returns {Promise<string>}
     */
    notePreview({ preview, key }: {
        preview: string;
        key: string;
    }): Promise<string>;
    /**
     * Decrypt a note tag name using the master keys or a given key.
     * @date 2/6/2024 - 2:56:38 AM
     *
     * @public
     * @async
     * @param {{name: string, key?: string}} param0
     * @param {string} param0.name
     * @param {string} param0.key
     * @returns {Promise<string>}
     */
    noteTagName({ name, key }: {
        name: string;
        key?: string;
    }): Promise<string>;
    /**
     * Decrypt a chat conversation name.
     * @date 2/20/2024 - 5:31:41 AM
     *
     * @public
     * @async
     * @param {{
     * 		name: string
     * 		key: string
     * 	}} param0
     * @param {string} param0.name
     * @param {string} param0.key
     * @returns {Promise<string>}
     */
    chatConversationName({ name, key }: {
        name: string;
        key: string;
    }): Promise<string>;
    /**
     * Decrypt data.
     * @date 2/7/2024 - 1:50:58 AM
     *
     * @public
     * @async
     * @param {{ data: Buffer; key: string; version: FileEncryptionVersion }} param0
     * @param {Buffer} param0.data
     * @param {string} param0.key
     * @param {FileEncryptionVersion} param0.version
     * @returns {Promise<Buffer>}
     */
    data({ data, key, version }: {
        data: Buffer;
        key: string;
        version: FileEncryptionVersion;
    }): Promise<Buffer>;
    /**
     * Decrypt a file/chunk using streams. Only available in a Node.JS environment.
     * @date 2/7/2024 - 1:38:12 AM
     *
     * @public
     * @async
     * @param {{
     * 		inputFile: string
     * 		key: string
     * 		version: FileEncryptionVersion
     * 		outputFile?: string
     * 	}} param0
     * @param {string} param0.inputFile
     * @param {string} param0.key
     * @param {FileEncryptionVersion} param0.version
     * @param {string} param0.outputFile
     * @returns {Promise<string>}
     */
    dataStream({ inputFile, key, version, outputFile }: {
        inputFile: string;
        key: string;
        version: FileEncryptionVersion;
        outputFile?: string;
    }): Promise<string>;
    /**
     * Decrypt a user event.
     *
     * @public
     * @async
     * @param {{ event: UserEvent }} param0
     * @param {UserEvent} param0.event
     * @returns {Promise<UserEvent>}
     */
    event({ event }: {
        event: UserEvent;
    }): Promise<UserEvent>;
}
export default Decrypt;
