import "dotenv/config"
import { getSDK } from "./sdk"
import crypto from "crypto"
import { txtCompatFile } from "./constants"
import { nameSplitter } from "../src/utils"

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
		}),
		sdk.fs().writeFile({
			path: "/compat-ts/nameSplitter.json",
			content: Buffer.from(
				JSON.stringify({
					name1: "General_Invitation_-_the_ECSO_Award_Finals_2024.docx",
					split1: nameSplitter("General_Invitation_-_the_ECSO_Award_Finals_2024.docx"),
					name2: "Screenshot 2023-05-16 201840.png",
					split2: nameSplitter("Screenshot 2023-05-16 201840.png"),
					name3: "!service-invoice-657c56116e4f6947a80001cc.pdf",
					split3: nameSplitter("!service-invoice-657c56116e4f6947a80001cc.pdf")
				}),
				"utf-8"
			)
		})
	])

	const fileEncryptionVersion = process.env.FILE_ENCRYPTION_VERSION ? parseInt(process.env.FILE_ENCRYPTION_VERSION) : null

	if (fileEncryptionVersion === null) {
		throw new Error("No fileEncryptionVersion defined.")
	}

	const txtCompatFileItem = await sdk.fs().writeFile({
		path: txtCompatFile.path,
		content: txtCompatFile.content,
		encryptionKey:
			fileEncryptionVersion === 3 ? Buffer.from(txtCompatFile.encryptionKey, "utf-8").toString("hex") : txtCompatFile.encryptionKey
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
