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

	it("upload+download stream large", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")
		const localPath = pathModule.join(os.tmpdir(), name)
		const downloadPath = pathModule.join(os.tmpdir(), `download.${name}`)

		await fs.writeFile(localPath, crypto.randomBytes(1024 * 1024 * 64))

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

	it("trash file", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")

		const item = await sdk.fs().writeFile({
			path: `/ts/${name}`,
			content: crypto.randomBytes(1)
		})

		await sdk.cloud().trashFile({
			uuid: item.uuid
		})

		const trash = await sdk.cloud().listTrash()

		expect(trash.some(i => i.uuid === item.uuid)).toBe(true)
	})

	it("restore file", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")
		const content = crypto.randomBytes(1)

		const item = await sdk.fs().writeFile({
			path: `/ts/${name}`,
			content
		})

		await sdk.cloud().trashFile({
			uuid: item.uuid
		})

		await sdk.cloud().restoreFile({
			uuid: item.uuid
		})

		const [list, stat, read] = await Promise.all([
			sdk.fs().readdir({
				path: "/ts"
			}),
			sdk.fs().stat({
				path: `/ts/${name}`
			}),
			sdk.fs().readFile({
				path: `/ts/${name}`
			})
		])

		expect(list).toContain(name)
		expect(stat.isFile()).toBe(true)
		expect(stat.type).toBe("file")
		expect(stat.name).toBe(name)
		expect(read.toString("hex")).toBe(content.toString("hex"))
		expect(stat.uuid).toBe(item.uuid)
	})

	it("trash dir", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")

		const uuid = await sdk.fs().mkdir({
			path: `/ts/${name}`
		})

		await sdk.cloud().trashDirectory({
			uuid
		})

		// Deleting/trashing a dir is not 100% immediate
		await new Promise<void>(resolve => setTimeout(resolve, 15000))

		const trash = await sdk.cloud().listTrash()

		expect(trash.some(i => i.uuid === uuid)).toBe(true)
	})

	it("restore dir", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")

		const uuid = await sdk.fs().mkdir({
			path: `/ts/${name}`
		})

		await sdk.cloud().trashDirectory({
			uuid
		})

		await sdk.cloud().restoreDirectory({
			uuid
		})

		const [list, stat] = await Promise.all([
			sdk.fs().readdir({
				path: "/ts"
			}),
			sdk.fs().stat({
				path: `/ts/${name}`
			})
		])

		expect(list).toContain(name)
		expect(stat.isDirectory()).toBe(true)
		expect(stat.type).toBe("directory")
		expect(stat.name).toBe(name)
		expect(stat.uuid).toBe(uuid)
	})

	it("version file", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")
		const content = crypto.randomBytes(1)

		await sdk.fs().writeFile({
			path: `/ts/${name}`,
			content
		})

		await sdk.fs().writeFile({
			path: `/ts/${name}`,
			content
		})

		const item = await sdk.fs().writeFile({
			path: `/ts/${name}`,
			content
		})

		const [list, stat, read] = await Promise.all([
			sdk.fs().readdir({
				path: "/ts"
			}),
			sdk.fs().stat({
				path: `/ts/${name}`
			}),
			sdk.fs().readFile({
				path: `/ts/${name}`
			})
		])

		expect(list).toContain(name)
		expect(stat.isFile()).toBe(true)
		expect(stat.type).toBe("file")
		expect(stat.name).toBe(name)
		expect(read.toString("hex")).toBe(content.toString("hex"))
		expect(stat.uuid).toBe(item.uuid)
	})

	it("delete file perm", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")

		const item = await sdk.fs().writeFile({
			path: `/ts/${name}`,
			content: crypto.randomBytes(1)
		})

		await sdk.cloud().deleteFile({
			uuid: item.uuid
		})

		const [trash, list] = await Promise.all([
			sdk.cloud().listTrash(),
			sdk.fs().readdir({
				path: "/ts"
			})
		])

		expect(trash.some(i => i.uuid === item.uuid)).toBe(false)
		expect(list).not.toContain(name)
	})

	it("delete dir perm", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")

		const uuid = await sdk.fs().mkdir({
			path: `/ts/${name}`
		})

		await sdk.cloud().deleteDirectory({
			uuid
		})

		// Deleting/trashing a dir is not 100% immediate
		await new Promise<void>(resolve => setTimeout(resolve, 15000))

		const [trash, list] = await Promise.all([
			sdk.cloud().listTrash(),
			sdk.fs().readdir({
				path: "/ts"
			})
		])

		expect(trash.some(i => i.uuid === uuid)).toBe(false)
		expect(list).not.toContain(name)
	})

	it("global search", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")

		const item = await sdk.fs().writeFile({
			path: `/ts/${name}`,
			content: crypto.randomBytes(1)
		})

		const query = await sdk.cloud().queryGlobalSearch(name)

		await sdk.cloud().deleteFile({
			uuid: item.uuid
		})

		expect(query.some(i => i.metadataDecrypted.name === name && i.type === "file" && i.uuid === item.uuid)).toBe(true)
	})

	it("file public link", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")

		const item = await sdk.fs().writeFile({
			path: `/ts/${name}`,
			content: crypto.randomBytes(1)
		})

		const linkUUID = await sdk.cloud().enablePublicLink({
			type: "file",
			uuid: item.uuid
		})

		const [list, passwordStatus] = await Promise.all([
			sdk.cloud().listPublicLinks(),
			sdk.cloud().filePublicLinkHasPassword({
				uuid: linkUUID
			})
		])

		await sdk.cloud().deleteFile({
			uuid: item.uuid
		})

		expect(list.some(i => i.uuid === item.uuid)).toBe(true)
		expect(passwordStatus.hasPassword).toBe(false)
	})

	it("file public link with password", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")

		const item = await sdk.fs().writeFile({
			path: `/ts/${name}`,
			content: crypto.randomBytes(1)
		})

		if (item.type !== "file") {
			throw new Error("Item not of type file.")
		}

		const linkUUID = await sdk.cloud().enablePublicLink({
			type: "file",
			uuid: item.uuid
		})

		await sdk.cloud().editPublicLink({
			type: "file",
			linkUUID,
			enableDownload: true,
			expiration: "never",
			password: name,
			itemUUID: item.uuid
		})

		const passwordStatus = await sdk.cloud().filePublicLinkHasPassword({
			uuid: linkUUID
		})

		const [linkStatus, info] = await Promise.all([
			sdk.cloud().publicLinkStatus({
				type: "file",
				uuid: item.uuid
			}),
			sdk.cloud().filePublicLinkInfo({
				uuid: linkUUID,
				password: name,
				salt: passwordStatus.salt,
				key: item.key
			})
		])

		await sdk.cloud().deleteFile({
			uuid: item.uuid
		})

		expect(passwordStatus.hasPassword).toBe(true)
		expect(typeof linkStatus.password === "string").toBe(true)
		expect(linkStatus.enabled).toBe(true)
		expect(info.name).toBe(name)
	})

	it("dir public link", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")

		const dirUUID = await sdk.fs().mkdir({
			path: `/ts/${name}`
		})

		const file = await sdk.fs().writeFile({
			path: `/ts/${name}/${name}`,
			content: crypto.randomBytes(1)
		})

		if (file.type !== "file") {
			throw new Error("Item not of type file.")
		}

		const linkUUID = await sdk.cloud().enablePublicLink({
			type: "directory",
			uuid: dirUUID
		})

		const info = await sdk.cloud().publicLinkStatus({
			type: "directory",
			uuid: dirUUID
		})

		if (!info.exists) {
			throw new Error("Link does not exist.")
		}

		const [list, content] = await Promise.all([
			sdk.cloud().listPublicLinks(),
			sdk.cloud().directoryPublicLinkContent({
				uuid: linkUUID,
				parent: dirUUID,
				key: await sdk.crypto().decrypt().folderLinkKey({
					metadata: info.key
				}),
				password: undefined,
				salt: undefined
			})
		])

		await sdk.fs().rm({
			path: `/ts/${name}`
		})

		expect(list.some(i => i.uuid === dirUUID)).toBe(true)
		expect(info.exists).toBe(true)
		expect(typeof info.password).not.toBe("string")
		expect(content.files.some(i => i.uuid === file.uuid)).toBe(true)
	})

	it("dir public link with password", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")

		const dirUUID = await sdk.fs().mkdir({
			path: `/ts/${name}`
		})

		const file = await sdk.fs().writeFile({
			path: `/ts/${name}/${name}`,
			content: crypto.randomBytes(1)
		})

		if (file.type !== "file") {
			throw new Error("Item not of type file.")
		}

		const linkUUID = await sdk.cloud().enablePublicLink({
			type: "directory",
			uuid: dirUUID
		})

		await sdk.cloud().editPublicLink({
			type: "directory",
			linkUUID,
			enableDownload: true,
			expiration: "never",
			password: name,
			itemUUID: dirUUID
		})

		const status = await sdk.cloud().publicLinkStatus({
			type: "directory",
			uuid: dirUUID
		})

		if (!status.exists) {
			throw new Error("Link does not exist.")
		}

		const info = await sdk.cloud().directoryPublicLinkInfo({
			uuid: linkUUID,
			key: await sdk.crypto().decrypt().folderLinkKey({
				metadata: status.key
			})
		})

		const [list, content] = await Promise.all([
			sdk.cloud().listPublicLinks(),
			sdk.cloud().directoryPublicLinkContent({
				uuid: linkUUID,
				parent: dirUUID,
				key: await sdk.crypto().decrypt().folderLinkKey({
					metadata: status.key
				}),
				password: name,
				salt: info.salt
			})
		])

		await sdk.fs().rm({
			path: `/ts/${name}`
		})

		expect(list.some(i => i.uuid === dirUUID)).toBe(true)
		expect(status.exists).toBe(true)
		expect(info.hasPassword).toBe(true)
		expect(typeof status.password).toBe("string")
		expect(content.files.some(i => i.uuid === file.uuid)).toBe(true)
	})
})
