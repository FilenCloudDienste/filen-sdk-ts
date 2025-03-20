import { getSDK } from "./sdk"
import { describe, it, expect, afterEach } from "vitest"
import crypto from "crypto"

afterEach(async () => {
	const sdk = await getSDK()
	const chats = await sdk.chats().conversations()

	await Promise.all(
		chats.map(async chat => {
			if (chat.ownerId === sdk.config.userId) {
				await sdk.chats().delete({
					conversation: chat.uuid
				})
			} else {
				await sdk.chats().leave({
					conversation: chat.uuid
				})
			}
		})
	)
})

describe("chats", () => {
	it("create solo", async () => {
		const sdk = await getSDK()
		const uuid = crypto.randomUUID()

		await sdk.chats().create({
			uuid
		})

		const chats = await sdk.chats().conversations()

		expect(chats.some(chat => chat.uuid === uuid)).toBe(true)
	})

	it("create multiple participants", async () => {
		const sdk = await getSDK()
		const uuid = crypto.randomUUID()

		const contacts = await sdk.contacts().all()

		await sdk.chats().create({
			uuid,
			contacts
		})

		const chats = await sdk.chats().conversations()

		expect(chats.some(chat => chat.uuid === uuid && chat.participants.length === contacts.length + 1)).toBe(true)
	})

	it("add participant", async () => {
		const sdk = await getSDK()
		const uuid = crypto.randomUUID()

		await sdk.chats().create({
			uuid
		})

		const contacts = await sdk.contacts().all()

		if (contacts.length === 0) {
			expect(true).toBe(true)

			return
		}

		await sdk.chats().addParticipant({
			conversation: uuid,
			contact: contacts.at(0)!
		})

		const chats = await sdk.chats().conversations()

		expect(chats.some(chat => chat.uuid === uuid && chat.participants.length === 2)).toBe(true)
	})

	it("remove participant", async () => {
		const sdk = await getSDK()
		const uuid = crypto.randomUUID()

		await sdk.chats().create({
			uuid
		})

		const contacts = await sdk.contacts().all()

		if (contacts.length === 0) {
			expect(true).toBe(true)

			return
		}

		await sdk.chats().addParticipant({
			conversation: uuid,
			contact: contacts.at(0)!
		})

		await sdk.chats().removeParticipant({
			conversation: uuid,
			userId: contacts.at(0)!.userId
		})

		const chats = await sdk.chats().conversations()

		expect(chats.some(chat => chat.uuid === uuid && chat.participants.length === 1)).toBe(true)
	})

	it("delete", async () => {
		const sdk = await getSDK()
		const uuid = crypto.randomUUID()

		await sdk.chats().create({
			uuid
		})

		await sdk.chats().delete({
			conversation: uuid
		})

		const chats = await sdk.chats().conversations()

		expect(chats.some(chat => chat.uuid === uuid)).toBe(false)
	})

	it("edit name", async () => {
		const sdk = await getSDK()
		const uuid = crypto.randomUUID()
		const name = crypto.randomBytes(16).toString("hex")

		await sdk.chats().create({
			uuid
		})

		await sdk.chats().editConversationName({
			conversation: uuid,
			name
		})

		const chats = await sdk.chats().conversations()

		expect(chats.some(chat => chat.uuid === uuid && chat.name === name)).toBe(true)
	})

	it("send message", async () => {
		const sdk = await getSDK()
		const uuid = crypto.randomUUID()
		const message = crypto.randomBytes(16).toString("hex")
		const messageUUID = crypto.randomUUID()

		await sdk.chats().create({
			uuid
		})

		await sdk.chats().sendMessage({
			conversation: uuid,
			uuid: messageUUID,
			message,
			replyTo: ""
		})

		const [chats, messages] = await Promise.all([
			sdk.chats().conversations(),
			sdk.chats().messages({
				conversation: uuid
			})
		])

		expect(chats.some(chat => chat.uuid === uuid)).toBe(true)
		expect(messages.some(m => m.conversation === uuid && m.uuid === messageUUID && m.message === message)).toBe(true)
	})

	it("send replyTo message", async () => {
		const sdk = await getSDK()
		const uuid = crypto.randomUUID()
		const message = crypto.randomBytes(16).toString("hex")
		const messageUUID = crypto.randomUUID()
		const replyToUUID = crypto.randomUUID()
		const replyToMessage = crypto.randomBytes(16).toString("hex")

		await sdk.chats().create({
			uuid
		})

		await sdk.chats().sendMessage({
			conversation: uuid,
			uuid: messageUUID,
			message,
			replyTo: ""
		})

		await sdk.chats().sendMessage({
			conversation: uuid,
			uuid: replyToUUID,
			message: replyToMessage,
			replyTo: messageUUID
		})

		const [chats, messages] = await Promise.all([
			sdk.chats().conversations(),
			sdk.chats().messages({
				conversation: uuid
			})
		])

		expect(chats.some(chat => chat.uuid === uuid)).toBe(true)
		expect(messages.some(m => m.conversation === uuid && m.uuid === messageUUID && m.message === message)).toBe(true)
		expect(
			messages.some(
				m => m.conversation === uuid && m.uuid === replyToUUID && m.message === replyToMessage && m.replyTo.uuid === messageUUID
			)
		).toBe(true)
	})

	it("edit message", async () => {
		const sdk = await getSDK()
		const uuid = crypto.randomUUID()
		const message = crypto.randomBytes(16).toString("hex")
		const newMessage = crypto.randomBytes(16).toString("hex")
		const messageUUID = crypto.randomUUID()

		await sdk.chats().create({
			uuid
		})

		await sdk.chats().sendMessage({
			conversation: uuid,
			uuid: messageUUID,
			message,
			replyTo: ""
		})

		await sdk.chats().editMessage({
			uuid: messageUUID,
			conversation: uuid,
			message: newMessage
		})

		const [chats, messages] = await Promise.all([
			sdk.chats().conversations(),
			sdk.chats().messages({
				conversation: uuid
			})
		])

		expect(chats.some(chat => chat.uuid === uuid)).toBe(true)
		expect(messages.some(m => m.conversation === uuid && m.uuid === messageUUID && m.message === message)).toBe(false)
		expect(messages.some(m => m.conversation === uuid && m.uuid === messageUUID && m.message === newMessage)).toBe(true)
	})

	it("delete message", async () => {
		const sdk = await getSDK()
		const uuid = crypto.randomUUID()
		const message = crypto.randomBytes(16).toString("hex")
		const messageUUID = crypto.randomUUID()

		await sdk.chats().create({
			uuid
		})

		await sdk.chats().sendMessage({
			conversation: uuid,
			uuid: messageUUID,
			message,
			replyTo: ""
		})

		await sdk.chats().deleteMessage({
			uuid: messageUUID
		})

		const [chats, messages] = await Promise.all([
			sdk.chats().conversations(),
			sdk.chats().messages({
				conversation: uuid
			})
		])

		expect(chats.some(chat => chat.uuid === uuid)).toBe(true)
		expect(messages.some(m => m.conversation === uuid && m.uuid === messageUUID && m.message === message)).toBe(false)
	})

	it("list messages", async () => {
		const sdk = await getSDK()
		const uuid = crypto.randomUUID()
		const message = crypto.randomBytes(16).toString("hex")

		await sdk.chats().create({
			uuid
		})

		await Promise.all(
			new Array(3).fill(0).map(async () => {
				await sdk.chats().sendMessage({
					conversation: uuid,
					uuid: crypto.randomUUID(),
					message,
					replyTo: ""
				})
			})
		)

		const [chats, messages] = await Promise.all([
			sdk.chats().conversations(),
			sdk.chats().messages({
				conversation: uuid
			})
		])

		expect(chats.some(chat => chat.uuid === uuid)).toBe(true)
		expect(messages.length).toBe(3)
		expect(
			JSON.stringify(
				messages
					.map(m => m.message)
					.sort((a, b) =>
						a.localeCompare(b, "en", {
							numeric: true
						})
					)
			)
		).toBe(
			JSON.stringify(
				[message, message, message].sort((a, b) =>
					a.localeCompare(b, "en", {
						numeric: true
					})
				)
			)
		)
	})

	it("send typing", async () => {
		const sdk = await getSDK()
		const uuid = crypto.randomUUID()

		await sdk.chats().create({
			uuid
		})

		const down = await sdk.chats().sendTyping({
			conversation: uuid,
			type: "down"
		})

		const up = await sdk.chats().sendTyping({
			conversation: uuid,
			type: "up"
		})

		expect(down).toBe(undefined)
		expect(up).toBe(undefined)
	})
})
