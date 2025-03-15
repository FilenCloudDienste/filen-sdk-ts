import { getSDK } from "./sdk"
import crypto from "crypto"
import { txtCompatFile } from "./constants"

export async function setup(): Promise<void> {
	const sdk = await getSDK()

	await sdk.fs().rm({
		path: "/ts"
	})

	await sdk.fs().mkdir({
		path: "/ts"
	})

	await sdk.cloud().emptyTrash()
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

	const txtCompatFileItem = await sdk.fs().writeFile({
		path: txtCompatFile.path,
		content: txtCompatFile.content
	})

	if (txtCompatFileItem.type !== "file") {
		throw new Error("txtCompatFileItem not of type file.")
	}

	await sdk.cloud().editFileMetadata({
		uuid: txtCompatFileItem.uuid,
		metadata: {
			name: txtCompatFileItem.name,
			creation: txtCompatFile.creation,
			lastModified: txtCompatFile.lastModified,
			hash: txtCompatFileItem.hash,
			mime: txtCompatFileItem.mime,
			key: txtCompatFileItem.key,
			size: txtCompatFileItem.size
		}
	})

	await sdk.cloud().emptyTrash()
}
