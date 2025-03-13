import { getSDK } from "./sdk"
import { describe, it, expect } from "vitest"
import crypto from "crypto"

describe("notes", () => {
	it("create", async () => {
		const sdk = await getSDK()
		const title = crypto.randomBytes(16).toString("hex")
		const uuid = crypto.randomUUID()

		await sdk.notes().create({
			title,
			uuid
		})

		const notes = await sdk.notes().all()

		expect(notes.some(note => note.uuid === uuid && note.title === title)).toBe(true)
	})

	it("edit title", async () => {
		const sdk = await getSDK()
		const title = crypto.randomBytes(16).toString("hex")
		const uuid = crypto.randomUUID()
		const newTitle = crypto.randomBytes(16).toString("hex")

		await sdk.notes().create({
			title,
			uuid
		})

		await sdk.notes().editTitle({
			title: newTitle,
			uuid
		})

		const notes = await sdk.notes().all()

		expect(notes.some(note => note.uuid === uuid && note.title === newTitle)).toBe(true)
	})

	it("archive", async () => {
		const sdk = await getSDK()
		const title = crypto.randomBytes(16).toString("hex")
		const uuid = crypto.randomUUID()

		await sdk.notes().create({
			title,
			uuid
		})

		await sdk.notes().archive({
			uuid
		})

		const notes = await sdk.notes().all()

		expect(notes.some(note => note.uuid === uuid && note.title === title && note.archive)).toBe(true)
	})

	it("favorite", async () => {
		const sdk = await getSDK()
		const title = crypto.randomBytes(16).toString("hex")
		const uuid = crypto.randomUUID()

		await sdk.notes().create({
			title,
			uuid
		})

		await sdk.notes().favorite({
			uuid,
			favorite: true
		})

		const notes = await sdk.notes().all()

		expect(notes.some(note => note.uuid === uuid && note.title === title && note.favorite)).toBe(true)
	})

	it("unfavorite", async () => {
		const sdk = await getSDK()
		const title = crypto.randomBytes(16).toString("hex")
		const uuid = crypto.randomUUID()

		await sdk.notes().create({
			title,
			uuid
		})

		await sdk.notes().favorite({
			uuid,
			favorite: true
		})

		await sdk.notes().favorite({
			uuid,
			favorite: false
		})

		const notes = await sdk.notes().all()

		expect(notes.some(note => note.uuid === uuid && note.title === title && !note.favorite)).toBe(true)
	})

	it("trash", async () => {
		const sdk = await getSDK()
		const title = crypto.randomBytes(16).toString("hex")
		const uuid = crypto.randomUUID()

		await sdk.notes().create({
			title,
			uuid
		})

		await sdk.notes().trash({
			uuid
		})

		const notes = await sdk.notes().all()

		expect(notes.some(note => note.uuid === uuid && note.title === title && note.trash)).toBe(true)
	})

	it("restore", async () => {
		const sdk = await getSDK()
		const title = crypto.randomBytes(16).toString("hex")
		const uuid = crypto.randomUUID()

		await sdk.notes().create({
			title,
			uuid
		})

		await sdk.notes().archive({
			uuid
		})

		await sdk.notes().trash({
			uuid
		})

		await sdk.notes().restore({
			uuid
		})

		const notes = await sdk.notes().all()

		expect(notes.some(note => note.uuid === uuid && note.title === title && !note.trash && !note.archive)).toBe(true)
	})

	it("delete", async () => {
		const sdk = await getSDK()
		const title = crypto.randomBytes(16).toString("hex")
		const uuid = crypto.randomUUID()

		await sdk.notes().create({
			title,
			uuid
		})

		await sdk.notes().delete({
			uuid
		})

		const notes = await sdk.notes().all()

		expect(notes.some(note => note.uuid === uuid && note.title === title)).toBe(false)
	})
})
