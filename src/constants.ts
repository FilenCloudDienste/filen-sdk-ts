import type { Environment } from "./types"

const env = {
	isBrowser:
		(typeof window !== "undefined" && typeof window.document !== "undefined") ||
		// @ts-expect-error WorkerEnv's are not typed
		("undefined" !== typeof WorkerGlobalScope && "function" === typeof importScripts && navigator instanceof WorkerNavigator),
	isNode: typeof process !== "undefined" && process.versions !== null && process.versions.node !== null,
	isReactNative: typeof global.nodeThread !== "undefined" && global.nodeThread !== null
} as const

export const environment: Environment = env.isBrowser ? "browser" : env.isNode ? "node" : "reactNative"

export const BUFFER_SIZE = 4096
export const BASE64_BUFFER_SIZE = 3 * 1024
export const MAX_CONCURRENT_DOWNLOADS = 32
export const MAX_DOWNLOAD_THREADS = 128
export const MAX_DOWNLOAD_WRITERS = 256
export const MAX_UPLOAD_THREADS = 16
export const CURRENT_FILE_ENCRYPTION_VERSION = 2
export const DEFAULT_UPLOAD_REGION = "de-1"
export const DEFAULT_UPLOAD_BUCKET = "filen-1"
export const UPLOAD_CHUNK_SIZE = 1024 * 1024
export const MAX_NOTE_SIZE = 1024 * 1024 - 1
export const MAX_CONCURRENT_LISTING_OPS = 64
export const MAX_CONCURRENT_UPLOADS = 8
export const MAX_CONCURRENT_DIRECTORY_UPLOADS = 4
export const MAX_CONCURRENT_DIRECTORY_DOWNLOADS = 8
