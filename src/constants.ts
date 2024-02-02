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
