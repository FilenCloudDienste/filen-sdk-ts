import { describe, it, expect } from "vitest"
import { APIClient } from "../src/api/client"
import { APIError } from "../src/api/errors"
import type FilenSDK from "../src"

/**
 * Retry contract of APIClient.request(): transient failures are retried, API errors ({ status: false }) are not, and an
 * aborted request stops right away instead of being retried every retryTimeout for up to maxRetries tries (an hour with
 * the defaults). The HTTP layer (get/post) is stubbed, so nothing goes over the network.
 *
 * Pure unit tests — no account/login needed (the credential-gated globalSetup runs in CI).
 */

type Attempt = (attempt: number) => Promise<unknown>

function createClient(attempt: Attempt): { client: APIClient; attempts: () => number } {
	const client = new APIClient({} as FilenSDK)
	let attempts = 0

	const send = async (): Promise<unknown> => {
		attempts++

		return await attempt(attempts)
	}

	Object.assign(client, {
		get: send,
		post: send
	})

	return {
		client,
		attempts: () => attempts
	}
}

const ok = (data: unknown) => ({
	status: 200,
	data: {
		status: true,
		data
	}
})

// Bounded so that a regression (an aborted request retried for an hour) fails the test instead of hanging the run.
const ABORT_TEST_TIMEOUT = 5000

describe("APIClient.request — retries and aborts", () => {
	it(
		"does not send an already aborted request",
		async () => {
			const controller = new AbortController()
			const { client, attempts } = createClient(async () => ok("unreachable"))

			controller.abort()

			await expect(
				client.request({
					method: "GET",
					endpoint: "/test",
					abortSignal: controller.signal
				})
			).rejects.toThrow(/aborted/i)

			expect(attempts()).toBe(0)
			expect(client.requestSemaphore.count()).toBe(0)
		},
		ABORT_TEST_TIMEOUT
	)

	it(
		"stops when the request is aborted in flight",
		async () => {
			const controller = new AbortController()
			const { client, attempts } = createClient(async () => {
				controller.abort()

				throw new Error("Aborted")
			})

			await expect(
				client.request({
					method: "GET",
					endpoint: "/test",
					abortSignal: controller.signal
				})
			).rejects.toThrow(/aborted/i)

			expect(attempts()).toBe(1)
			expect(client.requestSemaphore.count()).toBe(0)
		},
		ABORT_TEST_TIMEOUT
	)

	it(
		"stops when the request is aborted while waiting to retry",
		async () => {
			const controller = new AbortController()
			const { client, attempts } = createClient(async () => {
				throw new Error("ECONNRESET")
			})

			const startedAt = Date.now()

			setTimeout(() => controller.abort(), 50)

			await expect(
				client.request({
					method: "POST",
					endpoint: "/test",
					data: {},
					abortSignal: controller.signal,
					retryTimeout: 60000
				})
			).rejects.toThrow(/aborted/i)

			expect(attempts()).toBe(1)
			expect(Date.now() - startedAt).toBeLessThan(2000)
			expect(client.requestSemaphore.count()).toBe(0)
		},
		ABORT_TEST_TIMEOUT
	)

	it("retries network errors up to maxRetries, then throws the last error", async () => {
		const { client, attempts } = createClient(async attempt => {
			throw new Error(`ECONNRESET ${attempt}`)
		})

		await expect(
			client.request({
				method: "GET",
				endpoint: "/test",
				maxRetries: 3,
				retryTimeout: 1
			})
		).rejects.toThrow("ECONNRESET 3")

		expect(attempts()).toBe(3)
		expect(client.requestSemaphore.count()).toBe(0)
	})

	it("retries an invalid HTTP status, then returns the response data", async () => {
		const { client, attempts } = createClient(async attempt =>
			attempt === 1
				? {
						status: 502,
						data: null
				  }
				: ok({
						uuid: "abc"
				  })
		)

		await expect(
			client.request({
				method: "GET",
				endpoint: "/test",
				retryTimeout: 1
			})
		).resolves.toEqual({
			uuid: "abc"
		})

		expect(attempts()).toBe(2)
	})

	it("adds the raw JSON when includeRaw is set", async () => {
		const { client } = createClient(async () =>
			ok({
				uuid: "abc"
			})
		)

		await expect(
			client.request({
				method: "POST",
				endpoint: "/test",
				data: {},
				includeRaw: true
			})
		).resolves.toEqual({
			uuid: "abc",
			raw: JSON.stringify({
				uuid: "abc"
			})
		})
	})

	it("does not retry an API error", async () => {
		const { client, attempts } = createClient(async () => ({
			status: 200,
			data: {
				status: false,
				code: "folder_not_found",
				message: "Folder not found."
			}
		}))

		const error = await client
			.request({
				method: "POST",
				endpoint: "/test",
				data: {}
			})
			.catch(e => e)

		expect(error).toBeInstanceOf(APIError)
		expect((error as APIError).code).toBe("folder_not_found")
		expect(attempts()).toBe(1)
		expect(client.requestSemaphore.count()).toBe(0)
	})
})
