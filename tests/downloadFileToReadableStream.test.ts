import pathModule from "path"
import { UPLOAD_CHUNK_SIZE, type CloudItem } from "../src"
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import fs from "fs-extra"
import crypto from "crypto"
import { getSDK } from "./sdk"
import os from "os"

const localTestFile = pathModule.join(os.tmpdir(), `filen-sdk-test-${crypto.randomBytes(16).toString("hex")}.bin`)
let remoteTestFile: CloudItem | null = null

beforeAll(async () => {
	const sdk = await getSDK()

	await fs.writeFile(localTestFile, crypto.randomBytes(5242880))

	const parent = await sdk.fs().mkdir({
		path: "/ts"
	})

	remoteTestFile = await sdk.cloud().uploadLocalFile({
		source: localTestFile,
		parent
	})
}, 60000)

afterAll(async () => {
	await fs.rm(localTestFile)
}, 60000)

function bufferToHash(buffer: Buffer): string {
	return crypto.createHash("sha512").update(buffer).digest("hex")
}

function readFromDisk(start?: number, end?: number): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		const stream = fs.createReadStream(localTestFile, {
			start,
			end
		})

		const buffers: Buffer[] = []

		stream.on("data", (chunk: Buffer) => {
			buffers.push(chunk)
		})

		stream.on("close", () => {
			resolve(Buffer.concat(buffers))
		})

		stream.on("error", reject)
	})
}

async function readFromFilen(start?: number, end?: number): Promise<Buffer> {
	const sdk = await getSDK()

	if (!remoteTestFile || remoteTestFile.type !== "file") {
		throw new Error("Remote test file not defined.")
	}

	const stream = sdk.cloud().downloadFileToReadableStream({
		...remoteTestFile,
		start,
		end
	})

	const reader = stream.getReader()
	const buffers: Buffer[] = []

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const { done, value } = await reader.read()

		if (done) {
			break
		}

		buffers.push(value)
	}

	return Buffer.concat(buffers)
}

describe("downloadFileToReadableStream", () => {
	const chunkSize = UPLOAD_CHUNK_SIZE // 1 MiB
	const totalChunks = 5

	const testCases = [
		{
			start: 0,
			end: undefined,
			description: "entire file"
		},
		{
			start: undefined,
			end: undefined,
			description: "start and end undefined"
		},
		{
			start: undefined,
			end: 1337,
			description: "start undefined end defined"
		},
		{
			start: 0,
			end: 1024,
			description: "first 1 KiB"
		},
		{
			start: chunkSize - 512,
			end: chunkSize + 512,
			description: "crossing chunk boundary"
		},
		{
			start: 1.5 * chunkSize - 512,
			end: 3 * chunkSize + 512,
			description: "crossing chunk boundary large"
		},
		{
			start: chunkSize * 2,
			end: chunkSize * 2 + 1024,
			description: "within single chunk"
		},
		{
			start: chunkSize * (totalChunks - 1) - 1024,
			end: undefined,
			description: "from last chunk to end"
		},
		{
			start: 0,
			end: 0,
			description: "zero-length range"
		},
		{
			start: chunkSize * totalChunks + 1024,
			end: chunkSize * totalChunks + 2048,
			description: "out-of-bounds range"
		}
	]

	testCases.forEach(({ start, end, description }) => {
		it(`should correctly stream ${description}`, async () => {
			const [filenBuffer, diskBuffer] = await Promise.all([readFromFilen(start, end), readFromDisk(start, end)])

			expect(bufferToHash(filenBuffer)).toEqual(bufferToHash(diskBuffer))
		})
	})

	it("should handle reading beyond EOF gracefully", async () => {
		const start = chunkSize * totalChunks + 1024 // Beyond the last chunk
		const end = start + 1024
		const filenBuffer = await readFromFilen(start, end)

		expect(filenBuffer.byteLength).toBe(0) // Should be empty since it's beyond EOF
	})

	it("should handle large range from the middle of the file", async () => {
		const start = chunkSize * 2
		const end = chunkSize * (totalChunks - 1)

		const [filenBuffer, diskBuffer] = await Promise.all([readFromFilen(start, end - 1), readFromDisk(start, end - 1)])

		expect(bufferToHash(filenBuffer)).toEqual(bufferToHash(diskBuffer))
	})
})

describe("downloadFileToReadableStream - Extended Tests", () => {
	const chunkSize = UPLOAD_CHUNK_SIZE // 1 MiB
	const totalChunks = 5

	const extendedTestCases = [
		{
			start: 1536,
			end: 1792,
			description: "middle of a chunk with odd byte sizes"
		},
		{
			start: chunkSize - 1,
			end: chunkSize - 1,
			description: "end exactly at chunk boundary"
		},
		{
			start: chunkSize * totalChunks + 512,
			end: undefined,
			description: "start beyond file size"
		},
		{
			start: 0,
			end: 0,
			description: "zero-length range at start"
		},
		{
			start: chunkSize - 1,
			end: chunkSize * 2,
			description: "start near end of one chunk, cross into next"
		},
		{
			start: undefined,
			end: 512,
			description: "undefined start, small range read"
		},
		{
			start: undefined,
			end: undefined,
			description: "full file read"
		},
		{
			start: chunkSize * (totalChunks - 1),
			end: chunkSize * totalChunks - 1,
			description: "read only last chunk of file"
		}
	]

	extendedTestCases.forEach(({ start, end, description }) => {
		it(`should correctly handle ${description}`, async () => {
			const [filenBuffer, diskBuffer] = await Promise.all([readFromFilen(start, end), readFromDisk(start, end)])

			expect(bufferToHash(filenBuffer)).toEqual(bufferToHash(diskBuffer))
		})
	})

	it("should handle invalid ranges gracefully", async () => {
		const start = chunkSize * 2
		const end = chunkSize - 1 // Invalid since start > end

		await expect(readFromFilen(start, end)).resolves.toHaveLength(0)
	})

	it("should handle negative start and end values", async () => {
		const start = -100
		const end = -50

		await expect(readFromFilen(start, end)).resolves.toHaveLength(1)
	})

	it("should read only the last byte of the file", async () => {
		const start = chunkSize * totalChunks - 1
		const end = start

		const [filenBuffer, diskBuffer] = await Promise.all([readFromFilen(start, end), readFromDisk(start, end)])

		expect(bufferToHash(filenBuffer)).toEqual(bufferToHash(diskBuffer))
	})

	it("should handle a full file read correctly", async () => {
		const [filenBuffer, diskBuffer] = await Promise.all([readFromFilen(), readFromDisk()])

		expect(bufferToHash(filenBuffer)).toEqual(bufferToHash(diskBuffer))
	})

	it("should handle undefined start and defined end", async () => {
		const end = 512 // Define end only
		const [filenBuffer, diskBuffer] = await Promise.all([readFromFilen(undefined, end), readFromDisk(undefined, end)])

		expect(bufferToHash(filenBuffer)).toEqual(bufferToHash(diskBuffer))
	})
})
