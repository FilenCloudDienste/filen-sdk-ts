import { describe, it, expect } from "vitest"
import { nameSplitter } from "../src/utils"

describe("utils", () => {
	it("nameSplitter", async () => {
		const one = JSON.stringify(
			[
				".hei",
				".heic",
				"83.h",
				"83.heic",
				"1928",
				"2883",
				"192883",
				"192883heic",
				"eic",
				"g_19",
				"heic",
				"img",
				"img_",
				"img_192883",
				"img_192883.heic",
				"img19",
				"img1928",
				"img192883",
				"imgheic"
			].sort((a, b) =>
				a.localeCompare(b, "en", {
					numeric: true
				})
			)
		)

		const two = JSON.stringify(
			[
				"-005",
				"-0053",
				"-b2f",
				"-b2fe",
				".jpe",
				".jpeg",
				"0b9f",
				"0b9fc",
				"2fe-",
				"2fe-9",
				"3-45",
				"3-458",
				"6cef",
				"6cef5",
				"8e-b",
				"8e-b2",
				"9fcf",
				"9fcf-",
				"0053",
				"053-",
				"053-4",
				"58.j",
				"58.jp",
				"58.jpeg",
				"98ea",
				"98ea7",
				"98ea73",
				"98ea736cef58",
				"458e",
				"458e-",
				"736",
				"736c",
				"736ce",
				"940",
				"940b",
				"940b9",
				"940b9fc",
				"940b9fcf",
				"940b9fcf-0053-458e-b2fe-98ea736cef58.jpeg",
				"940b9fcf0",
				"0053458",
				"b2fe",
				"cf-0",
				"cf-00",
				"e-98",
				"e-98e",
				"ea73",
				"ea736",
				"ef58",
				"ef58.",
				"jpeg",
				"peg"
			].sort((a, b) =>
				a.localeCompare(b, "en", {
					numeric: true
				})
			)
		)

		const three = JSON.stringify(
			[
				" fol",
				" fold",
				" is ",
				" is a",
				"!!93",
				"!!933",
				"!9338",
				"338",
				"9338",
				"a te",
				"a tes",
				"der ",
				"der n",
				"e!!9338",
				"folder",
				"foldername!!9338",
				"is",
				"is i",
				"is is",
				"istest",
				"me!!",
				"me!!9",
				"name",
				"name!",
				"name!!",
				"name!!9338",
				"olde",
				"older",
				"r na",
				"r nam",
				"s a ",
				"s a t",
				"st f",
				"st fo",
				"test",
				"test ",
				"testfolder",
				"thi",
				"this",
				"this ",
				"this is a test folder name!!9338",
				"thisi",
				"thisis",
				"thisisa",
				"thisisate",
				"thisname!!9338"
			].sort((a, b) =>
				a.localeCompare(b, "en", {
					numeric: true
				})
			)
		)

		const oneGenerated = JSON.stringify(
			nameSplitter("IMG_192883.HEIC").sort((a, b) =>
				a.localeCompare(b, "en", {
					numeric: true
				})
			)
		)

		const twoGenerated = JSON.stringify(
			nameSplitter("940B9FCF-0053-458E-B2FE-98EA736CEF58.jpeg").sort((a, b) =>
				a.localeCompare(b, "en", {
					numeric: true
				})
			)
		)

		const threeGenerated = JSON.stringify(
			nameSplitter("this is a test folder name!!9338").sort((a, b) =>
				a.localeCompare(b, "en", {
					numeric: true
				})
			)
		)

		expect(oneGenerated).toBe(one)
		expect(twoGenerated).toBe(two)
		expect(threeGenerated).toBe(three)
	})
})
