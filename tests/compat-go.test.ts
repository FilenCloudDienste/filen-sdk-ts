import { getSDK } from "./sdk"
import { describe, it, expect } from "vitest"
import { isValidHexString } from "../src/utils"

describe("compat-go", () => {
	it("read", async () => {
		const sdk = await getSDK()

		const [list, dirStat, bigStat, emptyStat, smallStat, bigRead, smallRead] = await Promise.all([
			sdk.fs().readdir({
				path: "/compat-go"
			}),
			sdk.fs().stat({
				path: "/compat-go/dir"
			}),
			sdk.fs().stat({
				path: "/compat-go/big.txt"
			}),
			sdk.fs().stat({
				path: "/compat-go/empty.txt"
			}),
			sdk.fs().stat({
				path: "/compat-go/small.txt"
			}),
			sdk.fs().readFile({
				path: "/compat-go/big.txt"
			}),
			sdk.fs().readFile({
				path: "/compat-go/small.txt"
			})
		])

		expect(list).toContain("dir")
		expect(list).toContain("big.txt")
		expect(list).toContain("empty.txt")
		expect(list).toContain("small.txt")
		expect(dirStat.isDirectory()).toBe(true)
		expect(dirStat.type).toBe("directory")
		expect(bigStat.isFile()).toBe(true)
		expect(bigStat.type).toBe("file")
		expect(emptyStat.isFile()).toBe(true)
		expect(emptyStat.type).toBe("file")
		expect(smallStat.isFile()).toBe(true)
		expect(smallStat.type).toBe("file")
		expect(emptyStat.size).toBe(0)
		expect(isValidHexString(Buffer.from(bigRead).toString("hex"))).toBe(true)
		expect(Buffer.from(smallRead).toString("utf-8")).toBe("Hello World from Go!")
		expect(bigRead.byteLength).toBe(1024 * 1024 * 8)
		expect(smallRead.byteLength).toBe("Hello World from Go!".length)
	})
})
