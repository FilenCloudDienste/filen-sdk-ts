import type FilenSDK from "."
import { v4 as uuidv4 } from "uuid"
import { Semaphore } from "./semaphore"

/**
 * Lock
 *
 * @export
 * @class Lock
 * @typedef {Lock}
 */
export class Lock {
	private readonly sdk: FilenSDK
	private readonly resource: string
	private lockUUID: string | null = null
	private lockRefreshInterval: ReturnType<typeof setInterval> | undefined = undefined
	private mutex = new Semaphore(1)
	private acquiredCount: number = 0

	/**
	 * Creates an instance of Lock.
	 *
	 * @constructor
	 * @public
	 * @param {{ sdk: FilenSDK; resource: string }} param0
	 * @param {FilenSDK} param0.sdk
	 * @param {string} param0.resource
	 */
	public constructor({ sdk, resource }: { sdk: FilenSDK; resource: string }) {
		this.sdk = sdk
		this.resource = resource
	}

	/**
	 * Acquire the lock on <resource>.
	 *
	 * @public
	 * @async
	 * @returns {Promise<void>}
	 */
	public async acquire(): Promise<void> {
		await this.mutex.acquire()

		try {
			this.acquiredCount++

			if (this.acquiredCount > 1) {
				return
			}

			clearInterval(this.lockRefreshInterval)

			if (!this.lockUUID) {
				this.lockUUID = uuidv4()
			}

			await this.sdk.user().acquireResourceLock({
				resource: this.resource,
				lockUUID: this.lockUUID,
				maxTries: Infinity,
				tryTimeout: 1000
			})

			this.lockRefreshInterval = setInterval(async () => {
				if (this.acquiredCount === 0 || !this.lockUUID) {
					clearInterval(this.lockRefreshInterval)

					return
				}

				await this.mutex.acquire()

				try {
					await this.sdk.user().refreshResourceLock({
						resource: this.resource,
						lockUUID: this.lockUUID
					})
				} catch {
					// Noop
				} finally {
					this.mutex.release()
				}
			}, 15000)
		} finally {
			this.mutex.release()
		}
	}

	/**
	 * Release the acquired lock on <resource>.
	 *
	 * @public
	 * @async
	 * @returns {Promise<void>}
	 */
	public async release(): Promise<void> {
		await this.mutex.acquire()

		try {
			if (this.acquiredCount === 0 || !this.lockUUID) {
				return
			}

			if (--this.acquiredCount > 0) {
				return
			}

			clearInterval(this.lockRefreshInterval)

			await this.sdk.user().releaseResourceLock({
				resource: this.resource,
				lockUUID: this.lockUUID
			})

			this.acquiredCount = 0
			this.lockUUID = null
		} finally {
			this.mutex.release()
		}
	}
}

export default Lock
