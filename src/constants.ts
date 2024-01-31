const env = {
	isBrowser: typeof window !== "undefined" && typeof window.document !== "undefined",
	isNode: typeof process !== "undefined" && process.versions != null && process.versions.node != null,
	isReactNative: typeof navigator !== "undefined" && navigator.product === "ReactNative"
} as const

export const environment: "node" | "react-native" | "browser" =
	env.isBrowser && !env.isNode && !env.isReactNative
		? "browser"
		: env.isNode && !env.isBrowser && !env.isReactNative
		? "node"
		: "react-native"
