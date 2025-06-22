import {
	type Environment,
	type FileEncryptionVersion,
	type MetadataEncryptionVersion,
	type PublicLinkVersion,
	type AuthVersion
} from "./types"
import { type FilenSDKConfig } from "."
import os from "os"

export const isBrowser =
	(typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.navigator !== "undefined") ||
	// @ts-expect-error WorkerEnv's are not typed
	(typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) ||
	// @ts-expect-error WorkerEnv's are not typed
	(typeof ServiceWorkerGlobalScope !== "undefined" && self instanceof ServiceWorkerGlobalScope)

export const isReactNative =
	// @ts-expect-error Obviously not typed
	typeof global.IS_EXPO_REACT_NATIVE !== "undefined" ||
	// @ts-expect-error Obviously not typed
	typeof global.IS_REACT_NATIVE !== "undefined" ||
	// @ts-expect-error Obviously not typed
	typeof globalThis.IS_EXPO_REACT_NATIVE !== "undefined" ||
	// @ts-expect-error Obviously not typed
	typeof globalThis.IS_REACT_NATIVE !== "undefined"

export const environment: Environment = isBrowser ? "browser" : isReactNative ? "react-native" : "node"

export const CHUNK_SIZE = 1024 * 1024
export const BUFFER_SIZE = 4096
export const BASE64_BUFFER_SIZE = 3 * 1024

export const MAX_CONCURRENT_DOWNLOADS = 16
export const MAX_DOWNLOAD_THREADS = 32
export const MAX_DOWNLOAD_WRITERS = 64
export const MAX_UPLOAD_THREADS = 16

export const MAX_CONCURRENT_LISTING_OPS = 128
export const MAX_CONCURRENT_UPLOADS = 8
export const MAX_CONCURRENT_DIRECTORY_UPLOADS = 2
export const MAX_CONCURRENT_DIRECTORY_DOWNLOADS = 2
export const MAX_CONCURRENT_SHARES = 64

export const DEFAULT_UPLOAD_REGION = "de-1"
export const DEFAULT_UPLOAD_BUCKET = "filen-1"

export const UPLOAD_CHUNK_SIZE = 1024 * 1024
export const MAX_NOTE_SIZE = 1024 * 1024 - 1
export const MAX_CHAT_SIZE = 1024 * 64

export const ANONYMOUS_SDK_CONFIG: FilenSDKConfig = {
	email: "anonymous@filen.io",
	password: "anonymous",
	masterKeys: ["anonymous"],
	connectToSocket: false,
	metadataCache: true,
	twoFactorCode: "XXXXXX",
	publicKey: "anonymous",
	privateKey: "anonymous",
	apiKey: "anonymous",
	authVersion: 3,
	baseFolderUUID: "anonymous",
	userId: 1,
	tmpPath: os.tmpdir()
}

export const METADATA_ENCRYPTION_VERSION: MetadataEncryptionVersion = process?.env?.METADATA_ENCRYPTION_VERSION
	? (parseInt(process.env.METADATA_ENCRYPTION_VERSION) as MetadataEncryptionVersion)
	: 2

export const FILE_ENCRYPTION_VERSION: FileEncryptionVersion = process?.env?.FILE_ENCRYPTION_VERSION
	? (parseInt(process.env.FILE_ENCRYPTION_VERSION) as FileEncryptionVersion)
	: 2

export const PUBLIC_LINK_VERSION: PublicLinkVersion = process?.env?.PUBLIC_LINK_VERSION
	? (parseInt(process.env.PUBLIC_LINK_VERSION) as PublicLinkVersion)
	: 2

export const REGISTER_AUTH_VERSION: AuthVersion = process?.env?.REGISTER_AUTH_VERSION
	? (parseInt(process.env.REGISTER_AUTH_VERSION) as AuthVersion)
	: 2
