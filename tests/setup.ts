import { getSDK } from "./sdk"
import crypto from "crypto"

export async function setup(): Promise<void> {
	const sdk = await getSDK()

	await sdk.fs().rm({
		path: "/ts"
	})

	await Promise.all([
		sdk.fs().mkdir({
			path: "/ts"
		}),
		sdk.fs().mkdir({
			path: "/compat-ts"
		})
	])
}

export async function teardown(): Promise<void> {
	const sdk = await getSDK()

	await sdk.fs().rm({
		path: "/compat-ts"
	})

	await sdk.fs().mkdir({
		path: "/compat-ts"
	})

	await Promise.all([
		sdk.fs().rm({
			path: "/ts"
		}),
		sdk.fs().writeFile({
			path: "/compat-ts/empty.txt",
			content: Buffer.from([])
		}),
		sdk.fs().writeFile({
			path: "/compat-ts/small.txt",
			content: Buffer.from("Hello World from TypeScript!", "utf-8")
		}),
		sdk.fs().writeFile({
			path: "/compat-ts/big.txt",
			content: Buffer.from(crypto.randomBytes(1024 * 1024 * 4).toString("hex"), "utf-8")
		}),
		sdk.fs().mkdir({
			path: "/compat-ts/dir"
		})
	])
}
