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
