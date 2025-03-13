import { getSDK } from "./sdk"
import { describe, it, expect } from "vitest"
import crypto from "crypto"
import fs from "fs-extra"
import pathModule from "path"
import os from "os"
import { promisify } from "util"
import { pipeline } from "stream"

const pipelineAsync = promisify(pipeline)

describe("cloud", () => {
	it("upload+download stream", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")
		const localPath = pathModule.join(os.tmpdir(), name)
		const downloadPath = pathModule.join(os.tmpdir(), `download.${name}`)

		await fs.writeFile(localPath, crypto.randomBytes(1024 * 1024 * 4))

		const parent = await sdk.fs().mkdir({
			path: "/ts"
		})

		const item = await sdk.cloud().uploadLocalFileStream({
			parent,
			source: fs.createReadStream(localPath),
			name
		})

		if (item.type !== "file") {
			throw new Error("Item not of type file.")
		}

		await pipelineAsync(
			sdk.cloud().downloadFileToReadableStream({
				...item
			}),
			fs.createWriteStream(downloadPath)
		)

		const [local, remote] = await Promise.all([fs.readFile(localPath), fs.readFile(downloadPath)])

		await Promise.all([
			fs.rm(localPath, {
				force: true,
				maxRetries: 60 * 10,
				recursive: true,
				retryDelay: 100
			}),
			fs.rm(downloadPath, {
				force: true,
				maxRetries: 60 * 10,
				recursive: true,
				retryDelay: 100
			})
		])

		expect(remote.toString("hex")).toBe(local.toString("hex"))
	})
})
