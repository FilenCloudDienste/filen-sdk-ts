import { getSDK } from "./sdk"
import { describe, it, expect, beforeEach } from "vitest"
import crypto from "crypto"

beforeEach(async () => {
	const sdk = await getSDK()
	const [notes, notesTags] = await Promise.all([sdk.notes().all(), sdk.notes().tags()])

	await Promise.all([
		...notes.map(async note => {
			await sdk.notes().delete({
				uuid: note.uuid
			})
		}),
		...notesTags.map(async tag => {
			await sdk.notes().deleteTag({
				uuid: tag.uuid
			})
		})
	])
})

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

	it("duplicate", async () => {
		const sdk = await getSDK()
		const title = crypto.randomBytes(16).toString("hex")
		const uuid = crypto.randomUUID()
		const content = crypto.randomBytes(16).toString("hex")

		await sdk.notes().create({
			title,
			uuid
		})

		await sdk.notes().changeType({
			newType: "code",
			uuid
		})

		await sdk.notes().edit({
			type: "code",
			uuid,
			content
		})

		const duplicatedUUID = await sdk.notes().duplicate({
			uuid
		})

		const [notes, fetchedContent] = await Promise.all([
			sdk.notes().all(),
			sdk.notes().content({
				uuid: duplicatedUUID
			})
		])

		expect(notes.some(note => note.uuid === duplicatedUUID && note.title === title && note.type === "code")).toBe(true)
		expect(fetchedContent.content).toBe(content)
		expect(fetchedContent.type).toBe("code")
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

	it("edit content", async () => {
		const sdk = await getSDK()
		const title = crypto.randomBytes(16).toString("hex")
		const uuid = crypto.randomUUID()
		const content = crypto.randomBytes(16).toString("hex")
		const noteType = "text"

		await sdk.notes().create({
			title,
			uuid
		})

		await sdk.notes().edit({
			content,
			uuid,
			type: noteType
		})

		const [notes, fetchedContent] = await Promise.all([
			sdk.notes().all(),
			sdk.notes().content({
				uuid
			})
		])

		expect(notes.some(note => note.uuid === uuid && note.title === title && note.type === noteType)).toBe(true)
		expect(fetchedContent.content).toBe(content)
		expect(fetchedContent.type).toBe(noteType)
	})

	it("change type", async () => {
		const sdk = await getSDK()
		const title = crypto.randomBytes(16).toString("hex")
		const uuid = crypto.randomUUID()
		const content = crypto.randomBytes(16).toString("hex")
		const noteType = "text"
		const newNoteType = "code"

		await sdk.notes().create({
			title,
			uuid
		})

		await sdk.notes().edit({
			content,
			uuid,
			type: noteType
		})

		await sdk.notes().changeType({
			uuid,
			newType: newNoteType
		})

		const [notes, fetchedContent] = await Promise.all([
			sdk.notes().all(),
			sdk.notes().content({
				uuid
			})
		])

		expect(notes.some(note => note.uuid === uuid && note.title === title && note.type === newNoteType)).toBe(true)
		expect(fetchedContent.content).toBe(content)
		expect(fetchedContent.type).toBe(newNoteType)
	})

	it("add tag", async () => {
		const sdk = await getSDK()
		const title = crypto.randomBytes(16).toString("hex")
		const uuid = crypto.randomUUID()
		const tagName = crypto.randomBytes(16).toString("hex")

		await sdk.notes().create({
			title,
			uuid
		})

		const tagUUID = await sdk.notes().createTag({
			name: tagName
		})

		await sdk.notes().tag({
			uuid,
			tag: tagUUID
		})

		const notes = await sdk.notes().all()

		expect(
			notes.some(
				note => note.uuid === uuid && note.title === title && note.tags.some(tag => tag.name === tagName && tag.uuid === tagUUID)
			)
		).toBe(true)
	})

	it("remove tag", async () => {
		const sdk = await getSDK()
		const title = crypto.randomBytes(16).toString("hex")
		const uuid = crypto.randomUUID()
		const tagName = crypto.randomBytes(16).toString("hex")

		await sdk.notes().create({
			title,
			uuid
		})

		const tagUUID = await sdk.notes().createTag({
			name: tagName
		})

		await sdk.notes().tag({
			uuid,
			tag: tagUUID
		})

		await sdk.notes().untag({
			uuid,
			tag: tagUUID
		})

		const notes = await sdk.notes().all()

		expect(
			notes.some(
				note => note.uuid === uuid && note.title === title && !note.tags.some(tag => tag.name === tagName && tag.uuid === tagUUID)
			)
		).toBe(true)
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

	it("pin", async () => {
		const sdk = await getSDK()
		const title = crypto.randomBytes(16).toString("hex")
		const uuid = crypto.randomUUID()

		await sdk.notes().create({
			title,
			uuid
		})

		await sdk.notes().pin({
			uuid,
			pin: true
		})

		const notes = await sdk.notes().all()

		expect(notes.some(note => note.uuid === uuid && note.title === title && note.pinned)).toBe(true)
	})

	it("unpin", async () => {
		const sdk = await getSDK()
		const title = crypto.randomBytes(16).toString("hex")
		const uuid = crypto.randomUUID()

		await sdk.notes().create({
			title,
			uuid
		})

		await sdk.notes().pin({
			uuid,
			pin: true
		})

		await sdk.notes().pin({
			uuid,
			pin: false
		})

		const notes = await sdk.notes().all()

		expect(notes.some(note => note.uuid === uuid && note.title === title && !note.pinned)).toBe(true)
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

	it("create tag", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")

		const uuid = await sdk.notes().createTag({
			name
		})

		const tags = await sdk.notes().tags()

		expect(tags.some(tag => tag.uuid === uuid && tag.name === name)).toBe(true)
	})

	it("favorite tag", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")

		const uuid = await sdk.notes().createTag({
			name
		})

		await sdk.notes().tagFavorite({
			uuid,
			favorite: true
		})

		const tags = await sdk.notes().tags()

		expect(tags.some(tag => tag.uuid === uuid && tag.name === name && tag.favorite)).toBe(true)
	})

	it("unfavorite tag", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")

		const uuid = await sdk.notes().createTag({
			name
		})

		await sdk.notes().tagFavorite({
			uuid,
			favorite: true
		})

		await sdk.notes().tagFavorite({
			uuid,
			favorite: false
		})

		const tags = await sdk.notes().tags()

		expect(tags.some(tag => tag.uuid === uuid && tag.name === name && !tag.favorite)).toBe(true)
	})

	it("rename tag", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")
		const newName = crypto.randomBytes(16).toString("hex")

		const uuid = await sdk.notes().createTag({
			name
		})

		await sdk.notes().renameTag({
			uuid,
			name: newName
		})

		const tags = await sdk.notes().tags()

		expect(tags.some(tag => tag.uuid === uuid && tag.name === newName)).toBe(true)
	})

	it("delete tag", async () => {
		const sdk = await getSDK()
		const name = crypto.randomBytes(16).toString("hex")
		const newName = crypto.randomBytes(16).toString("hex")

		const uuid = await sdk.notes().createTag({
			name
		})

		await sdk.notes().deleteTag({
			uuid
		})

		const tags = await sdk.notes().tags()

		expect(tags.some(tag => tag.uuid === uuid && tag.name === newName)).toBe(false)
	})
})
