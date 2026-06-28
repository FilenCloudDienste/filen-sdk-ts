/**
 * Semaphore
 *
 * @export
 * @class Semaphore
 * @typedef {Semaphore}
 */
export class Semaphore {
	private counter: number = 0
	// FIFO queue of pending acquirers. Appended on acquire and consumed from `head` on release, instead of
	// `Array.shift()` — shift is O(n) (it re-indexes the whole array), so a large fan-out (e.g. every chunk
	// of a huge upload/download, or every queued API request behind the request semaphore) was O(N²): the
	// queue grows to ~N and each of the N releases shifted an ~N-length array. The head pointer makes each
	// dequeue O(1) amortized; the consumed prefix is compacted occasionally so a long-lived semaphore never
	// retains an unbounded backing array.
	private waiting: Array<
		| {
				resolve: (value: void | PromiseLike<void>) => void
				reject: (reason?: unknown) => void
		  }
		| undefined
	> = []
	private head: number = 0
	private maxCount: number

	/**
	 * Creates an instance of Semaphore.
	 *
	 * @constructor
	 * @public
	 * @param {number} [max=1]
	 */
	public constructor(max: number = 1) {
		this.maxCount = max
	}

	/**
	 * Acquire a lock.
	 *
	 * @public
	 * @returns {Promise<void>}
	 */
	public acquire(): Promise<void> {
		if (this.counter < this.maxCount) {
			this.counter++

			return Promise.resolve()
		} else {
			return new Promise<void>((resolve, reject) => {
				this.waiting.push({
					resolve,
					reject
				})
			})
		}
	}

	/**
	 * Release a lock.
	 *
	 * @public
	 */
	public release(): void {
		if (this.counter <= 0) {
			return
		}

		this.counter--

		this.processQueue()
	}

	/**
	 * Returns the locks in the queue.
	 *
	 * @public
	 * @returns {number}
	 */
	public count(): number {
		return this.counter
	}

	/**
	 * Set max number of concurrent locks.
	 *
	 * @public
	 * @param {number} newMax
	 */
	public setMax(newMax: number): void {
		this.maxCount = newMax

		this.processQueue()
	}

	/**
	 * Purge all waiting promises.
	 *
	 * @public
	 * @returns {number}
	 */
	public purge(): number {
		const unresolved = this.waiting.length - this.head

		for (let i = this.head; i < this.waiting.length; i++) {
			this.waiting[i]?.reject("Task has been purged")
		}

		this.counter = 0
		this.waiting = []
		this.head = 0

		return unresolved
	}

	/**
	 * Internal process queue.
	 *
	 * @private
	 */
	private processQueue(): void {
		if (this.head < this.waiting.length && this.counter < this.maxCount) {
			this.counter++

			const waiter = this.waiting[this.head]

			// Null the consumed slot so its closure can be GC'd, then advance the head pointer (O(1) dequeue).
			this.waiting[this.head] = undefined
			this.head++

			// Compact once the consumed prefix dominates the array (amortized O(1): a slice of length `head`
			// runs at most once per `head` dequeues), so a long-running semaphore doesn't grow without bound.
			if (this.head >= 1024 && this.head * 2 >= this.waiting.length) {
				this.waiting = this.waiting.slice(this.head)
				this.head = 0
			}

			if (waiter) {
				waiter.resolve()
			}
		}
	}
}

export default Semaphore
