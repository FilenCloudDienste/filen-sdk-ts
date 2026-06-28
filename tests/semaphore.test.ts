import { describe, it, expect } from "vitest"
import { Semaphore } from "../src/semaphore"

/**
 * Regression tests for the O(1)-dequeue Semaphore (the waiting queue uses a head pointer instead of the
 * O(n) Array.shift(), so a large fan-out — every chunk of a big upload/download, every queued API request
 * — is O(N) instead of O(N²)). These pin the behavioral contract the optimization must preserve at queue
 * depths where a regression would show: FIFO wake order, the concurrency cap, and purge accounting.
 *
 * Pure unit tests — no account/login needed (the credential-gated globalSetup runs in CI).
 */

const tick = (): Promise<void> => new Promise<void>(resolve => setTimeout(resolve, 0))

describe("Semaphore — large fan-out invariants", () => {
	it("preserves strict FIFO wake order across thousands of queued waiters", async () => {
		const sem = new Semaphore(1)

		await sem.acquire()

		const order: number[] = []
		const count = 3_000
		const waiters: Promise<void>[] = []

		for (let i = 0; i < count; i++) {
			waiters.push(
				(async () => {
					await sem.acquire()

					order.push(i)

					sem.release()
				})()
			)
		}

		await tick()
		sem.release()

		await Promise.all(waiters)

		expect(order.length).toBe(count)

		for (let i = 0; i < count; i++) {
			expect(order[i]).toBe(i)
		}

		expect(sem.count()).toBe(0)
	})

	it("never exceeds the concurrency cap and reaches it under heavy contention", async () => {
		const width = 10
		const sem = new Semaphore(width)
		let running = 0
		let maxRunning = 0

		await Promise.all(
			Array.from({ length: 5_000 }, async () => {
				await sem.acquire()

				running++
				maxRunning = Math.max(maxRunning, running)

				await tick()

				running--

				sem.release()
			})
		)

		expect(maxRunning).toBe(width)
		expect(sem.count()).toBe(0)
	})

	it("works for a width far above the compaction threshold (1024)", async () => {
		const width = 2_000
		const sem = new Semaphore(width)
		let running = 0
		let maxRunning = 0

		await Promise.all(
			Array.from({ length: 6_000 }, async () => {
				await sem.acquire()

				running++
				maxRunning = Math.max(maxRunning, running)

				await tick()

				running--

				sem.release()
			})
		)

		expect(maxRunning).toBe(width)
		expect(sem.count()).toBe(0)
	})

	it("drains thousands of sequential width-1 contenders (head-index compaction path)", async () => {
		const sem = new Semaphore(1)

		await sem.acquire()

		let done = 0
		const count = 8_000
		const waiters = Array.from({ length: count }, async () => {
			await sem.acquire()

			done++

			sem.release()
		})

		await tick()
		sem.release()

		await Promise.all(waiters)

		expect(done).toBe(count)
		expect(sem.count()).toBe(0)
	})

	it("purge() after a large fan-out rejects every waiter, returns the count, and resets", async () => {
		const sem = new Semaphore(1)

		await sem.acquire()

		const count = 1_500
		const settled: Promise<string>[] = []

		for (let i = 0; i < count; i++) {
			settled.push(sem.acquire().then(() => "resolved", () => "rejected"))
		}

		await tick()

		expect(sem.purge()).toBe(count)
		expect(sem.count()).toBe(0)

		const outcomes = await Promise.all(settled)

		expect(outcomes.every(outcome => outcome === "rejected")).toBe(true)
	})

	it("setMax raises concurrency and unblocks a waiter", async () => {
		const sem = new Semaphore(1)

		await sem.acquire()

		let secondAcquired = false
		const second = sem.acquire().then(() => {
			secondAcquired = true
		})

		await tick()

		expect(secondAcquired).toBe(false)

		sem.setMax(2)

		await second

		expect(secondAcquired).toBe(true)
		expect(sem.count()).toBe(2)
	})
})
