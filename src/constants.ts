import type { Environment } from "./types"

const env = {
	isBrowser: typeof window !== "undefined" && typeof window.document !== "undefined",
	isNode: typeof process !== "undefined" && process.versions !== null && process.versions.node !== null,
	isReactNative: typeof global.nodeThread !== "undefined" && global.nodeThread !== null
} as const

export const environment: Environment =
	env.isBrowser && !env.isNode && !env.isReactNative
		? "browser"
		: env.isNode && !env.isBrowser && !env.isReactNative
		? "node"
		: "reactNative"

export const BUFFER_SIZE = 4096
export const BASE64_BUFFER_SIZE = 3 * 1024
export const MAX_CONCURRENT_DOWNLOADS = 10
export const MAX_DOWNLOAD_THREADS = 64
export const MAX_DOWNLOAD_WRITERS = 128
export const MAX_UPLOAD_THREADS = 16
export const CURRENT_FILE_ENCRYPTION_VERSION = 2
export const DEFAULT_UPLOAD_REGION = "de-1"
export const DEFAULT_UPLOAD_BUCKET = "filen-1"
export const UPLOAD_CHUNK_SIZE = 1024 * 1024
