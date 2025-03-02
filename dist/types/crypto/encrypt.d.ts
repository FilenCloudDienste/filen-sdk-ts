/// <reference types="node" />
import { type FilenSDK, type FileEncryptionVersion } from "..";
/**
 * Encrypt
 * @date 2/1/2024 - 2:44:28 AM
 *
 * @export
 * @class Encrypt
 * @typedef {Encrypt}
 */
export declare class Encrypt {
    private readonly sdk;
    private readonly textEncoder;
    constructor(sdk: FilenSDK);
    keyLengthToVersionMetdata(key: string): number;
    metadata({ metadata, key, derive }: {
        metadata: string;
        key?: string;
        derive?: boolean;
    }): Promise<string>;
    /**
     * Encrypts metadata using a public key.
     * @date 2/2/2024 - 6:49:12 PM
     *
     * @public
     * @async
     * @param {{ metadata: string; publicKey: string }} param0
     * @param {string} param0.metadata
     * @param {string} param0.publicKey
     * @returns {Promise<string>}
     */
    metadataPublic({ metadata, publicKey }: {
        metadata: string;
        publicKey: string;
    }): Promise<string>;
    /**
     * Encrypt a chat message using the conversation encryption key.
     * @date 2/6/2024 - 3:01:09 AM
     *
     * @public
     * @async
     * @param {{ message: string; key: string }} param0
     * @param {string} param0.message
     * @param {string} param0.key
     * @returns {Promise<string>}
     */
    chatMessage({ message, key }: {
        message: string;
        key: string;
    }): Promise<string>;
    /**
     * Encrypt note content using the note's encryption key.
     * @date 2/6/2024 - 3:02:23 AM
     *
     * @public
     * @async
     * @param {{ content: string; key: string }} param0
     * @param {string} param0.content
     * @param {string} param0.key
     * @returns {Promise<string>}
     */
    noteContent({ content, key }: {
        content: string;
        key: string;
    }): Promise<string>;
    /**
     * Encrypt the note's title using the note's encryption key.
     * @date 2/6/2024 - 3:02:44 AM
     *
     * @public
     * @async
     * @param {{ title: string; key: string }} param0
     * @param {string} param0.title
     * @param {string} param0.key
     * @returns {Promise<string>}
     */
    noteTitle({ title, key }: {
        title: string;
        key: string;
    }): Promise<string>;
    /**
     * Encrypt the note's preview using the note's encryption key.
     * @date 2/6/2024 - 3:02:56 AM
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
     * Encrypt a tag's name using the given key.
     * @date 2/20/2024 - 3:21:12 AM
     *
     * @public
     * @async
     * @param {{ name: string; key?: string }} param0
     * @param {string} param0.name
     * @param {string} param0.key
     * @returns {Promise<string>}
     */
    noteTagName({ name, key }: {
        name: string;
        key?: string;
    }): Promise<string>;
    /**
     * Encrypt the conversation name using the conversation encryption key.
     * @date 2/6/2024 - 3:03:45 AM
     *
     * @public
     * @async
     * @param {{ name: string; key: string }} param0
     * @param {string} param0.name
     * @param {string} param0.key
     * @returns {Promise<string>}
     */
    chatConversationName({ name, key }: {
        name: string;
        key: string;
    }): Promise<string>;
    keyLengthToVersionData(key: string): FileEncryptionVersion;
    data({ data, key }: {
        data: Buffer;
        key: string;
    }): Promise<Buffer>;
    dataStream({ inputFile, key, outputFile }: {
        inputFile: string;
        key: string;
        outputFile?: string;
    }): Promise<string>;
}
export default Encrypt;
