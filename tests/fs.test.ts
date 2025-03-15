import { getSDK } from "./sdk"
import { describe, it, expect } from "vitest"
import crypto from "crypto"
import fs from "fs-extra"
import pathModule from "path"
import os from "os"

describe("fs", () => {
	it("mkdir", async () => {
		const sdk = await getSDK()
		const path = `/ts/${crypto.randomBytes(16).toString("hex")}`

		await sdk.fs().mkdir({
			path
		})

		const stat = await sdk.fs().stat({
			path
		})

		expect(stat.isDirectory()).toBe(true)
		expect(stat.type).toBe("directory")
		expect(stat.name).toBe(path.replace("/ts/", ""))
	})

	it("upload+download file", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")
		const localPath = pathModule.join(os.tmpdir(), name)
		const downloadPath = pathModule.join(os.tmpdir(), `download.${name}`)

		await fs.writeFile(localPath, crypto.randomBytes(1024 * 1024 * 4))

		await sdk.fs().upload({
			path: `/ts/${name}`,
			source: localPath
		})

		await sdk.fs().download({
			path: `/ts/${name}`,
			destination: downloadPath
		})

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

	it("upload+download dir", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")
		const localPath = pathModule.join(os.tmpdir(), name)
		const downloadPath = pathModule.join(os.tmpdir(), `download.${name}`)
		const fileContent = crypto.randomBytes(1024).toString("hex")

		await fs.mkdir(pathModule.join(localPath, "intermediate", "dir"), {
			recursive: true
		})

		await fs.writeFile(pathModule.join(localPath, "intermediate", "dir", "file.txt"), fileContent, "utf-8")

		await sdk.fs().upload({
			path: `/ts/${name}`,
			source: localPath
		})

		await sdk.fs().download({
			path: `/ts/${name}`,
			destination: downloadPath
		})

		const [local, remote, remoteFile] = await Promise.all([
			fs.readdir(localPath, {
				recursive: true,
				withFileTypes: false
			}),
			fs.readdir(downloadPath, {
				recursive: true,
				withFileTypes: false
			}),
			fs.readFile(pathModule.join(downloadPath, "intermediate", "dir", "file.txt"), "utf-8")
		])

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

		expect(
			JSON.stringify(
				(local as unknown as string[]).sort((a, b) =>
					a.toLowerCase().localeCompare(b.toLowerCase(), "en", {
						numeric: true
					})
				)
			)
		).toBe(
			JSON.stringify(
				(remote as unknown as string[]).sort((a, b) =>
					a.toLowerCase().localeCompare(b.toLowerCase(), "en", {
						numeric: true
					})
				)
			)
		)
		expect(remoteFile).toBe(fileContent)
	})

	it("mkdir intermediates", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")

		await sdk.fs().mkdir({
			path: `/ts/mkdir/intermediate/directory/${name}`
		})

		const list = await sdk.fs().readdir({
			path: "/ts",
			recursive: true
		})

		expect(list).toContain(`mkdir/intermediate/directory/${name}`)
	})

	it("upload empty file", async () => {
		const sdk = await getSDK()
		const path = `/ts/${crypto.randomBytes(16).toString("hex")}`

		await sdk.fs().writeFile({
			path,
			content: Buffer.from([])
		})

		const stat = await sdk.fs().stat({
			path
		})

		expect(stat.isFile()).toBe(true)
		expect(stat.type).toBe("file")
		expect(stat.size).toBe(0)
		expect(stat.name).toBe(path.replace("/ts/", ""))
	})

	it("rmdir", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")

		await sdk.fs().mkdir({
			path: `/ts/${name}`
		})

		await sdk.fs().rm({
			path: `/ts/${name}`
		})

		// Deleting/trashing a dir is not 100% immediate
		await new Promise<void>(resolve => setTimeout(resolve, 15000))

		const list = await sdk.fs().readdir({
			path: "/ts"
		})

		expect(list).not.toContain(name)
	})

	it("rmfile", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")

		await sdk.fs().writeFile({
			path: `/ts/${name}`,
			content: Buffer.from([])
		})

		await sdk.fs().rm({
			path: `/ts/${name}`
		})

		const list = await sdk.fs().readdir({
			path: "/ts"
		})

		expect(list).not.toContain(name)
	})

	it("rename dir", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")
		const newName = crypto.randomBytes(16).toString("hex")

		await sdk.fs().mkdir({
			path: `/ts/${name}`
		})

		await sdk.fs().rename({
			from: `/ts/${name}`,
			to: `/ts/${newName}`
		})

		const [list, stat] = await Promise.all([
			sdk.fs().readdir({
				path: "/ts/"
			}),
			sdk.fs().stat({
				path: `/ts/${newName}`
			})
		])

		expect(list).toContain(newName)
		expect(list).not.toContain(name)
		expect(stat.isDirectory()).toBe(true)
		expect(stat.type).toBe("directory")
		expect(stat.name).toBe(newName)
	})

	it("rename file", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")
		const newName = crypto.randomBytes(16).toString("hex")

		await sdk.fs().writeFile({
			path: `/ts/${name}`,
			content: crypto.randomBytes(1024)
		})

		await sdk.fs().rename({
			from: `/ts/${name}`,
			to: `/ts/${newName}`
		})

		const [list, stat] = await Promise.all([
			sdk.fs().readdir({
				path: "/ts"
			}),
			sdk.fs().stat({
				path: `/ts/${newName}`
			})
		])

		expect(list).toContain(newName)
		expect(list).not.toContain(name)
		expect(stat.isFile()).toBe(true)
		expect(stat.type).toBe("file")
		expect(stat.name).toBe(newName)
	})

	it("move dir", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")
		const newName = crypto.randomBytes(16).toString("hex")
		const newPathIntermediate = crypto.randomBytes(16).toString("hex")
		const newPath = `/ts/${newPathIntermediate}/${newName}`

		await sdk.fs().mkdir({
			path: `/ts/${name}`
		})

		await sdk.fs().rename({
			from: `/ts/${name}`,
			to: newPath
		})

		const [list, stat] = await Promise.all([
			sdk.fs().readdir({
				path: `/ts/${newPathIntermediate}`
			}),
			sdk.fs().stat({
				path: newPath
			})
		])

		expect(list).toContain(newName)
		expect(list).not.toContain(name)
		expect(stat.isDirectory()).toBe(true)
		expect(stat.type).toBe("directory")
		expect(stat.name).toBe(newName)
	})

	it("move file", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")
		const newName = crypto.randomBytes(16).toString("hex")
		const newPathIntermediate = crypto.randomBytes(16).toString("hex")
		const newPath = `/ts/${newPathIntermediate}/${newName}`
		const content = crypto.randomBytes(1024)

		await sdk.fs().writeFile({
			path: `/ts/${name}`,
			content
		})

		await sdk.fs().rename({
			from: `/ts/${name}`,
			to: newPath
		})

		const [list, stat, read] = await Promise.all([
			sdk.fs().readdir({
				path: `/ts/${newPathIntermediate}`
			}),
			sdk.fs().stat({
				path: newPath
			}),
			sdk.fs().readFile({
				path: newPath
			})
		])

		expect(list).toContain(newName)
		expect(list).not.toContain(name)
		expect(stat.isFile()).toBe(true)
		expect(stat.type).toBe("file")
		expect(stat.name).toBe(newName)
		expect(read.toString("hex")).toBe(content.toString("hex"))
	})

	it("copy file", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")
		const newName = crypto.randomBytes(16).toString("hex")
		const newPathIntermediate = crypto.randomBytes(16).toString("hex")
		const newPath = `/ts/${newPathIntermediate}/${newName}`
		const content = crypto.randomBytes(1024)

		await sdk.fs().writeFile({
			path: `/ts/${name}`,
			content
		})

		await sdk.fs().cp({
			from: `/ts/${name}`,
			to: newPath
		})

		const [list, stat, read] = await Promise.all([
			sdk.fs().readdir({
				path: `/ts/${newPathIntermediate}`
			}),
			sdk.fs().stat({
				path: newPath
			}),
			sdk.fs().readFile({
				path: newPath
			})
		])

		expect(list).toContain(newName)
		expect(list).not.toContain(name)
		expect(stat.isFile()).toBe(true)
		expect(stat.type).toBe("file")
		expect(stat.name).toBe(newName)
		expect(read.toString("hex")).toBe(content.toString("hex"))
	})

	it("copy dir", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")
		const newName = crypto.randomBytes(16).toString("hex")
		const newPathIntermediate = crypto.randomBytes(16).toString("hex")
		const newPath = `/ts/${newPathIntermediate}/${newName}`
		const content = crypto.randomBytes(1024)

		await sdk.fs().mkdir({
			path: `/ts/${name}`
		})

		await sdk.fs().writeFile({
			path: `/ts/${name}/file`,
			content
		})

		await sdk.fs().cp({
			from: `/ts/${name}`,
			to: newPath
		})

		const [list, stat, read] = await Promise.all([
			sdk.fs().readdir({
				path: `/ts/${newPathIntermediate}`
			}),
			sdk.fs().stat({
				path: newPath
			}),
			sdk.fs().readFile({
				path: `${newPath}/file`
			})
		])

		expect(list).toContain(newName)
		expect(list).not.toContain(name)
		expect(stat.isDirectory()).toBe(true)
		expect(stat.type).toBe("directory")
		expect(stat.name).toBe(newName)
		expect(read.toString("hex")).toBe(content.toString("hex"))
	})
})
