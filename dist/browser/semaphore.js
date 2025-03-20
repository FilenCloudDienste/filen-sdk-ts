/**
 * Semaphore
 *
 * @export
 * @class Semaphore
 * @typedef {Semaphore}
 */
export class Semaphore {
    counter = 0;
    waiting = [];
    maxCount;
    /**
     * Creates an instance of Semaphore.
     *
     * @constructor
     * @public
     * @param {number} [max=1]
     */
    constructor(max = 1) {
        this.maxCount = max;
    }
    /**
     * Acquire a lock.
     *
     * @public
     * @returns {Promise<void>}
     */
    acquire() {
        if (this.counter < this.maxCount) {
            this.counter++;
            return Promise.resolve();
        }
        else {
            return new Promise((resolve, reject) => {
                this.waiting.push({
                    resolve,
                    reject
                });
            });
        }
    }
    /**
     * Release a lock.
     *
     * @public
     */
    release() {
        if (this.counter <= 0) {
            return;
        }
        this.counter--;
        this.processQueue();
    }
    /**
     * Returns the locks in the queue.
     *
     * @public
     * @returns {number}
     */
    count() {
        return this.counter;
    }
    /**
     * Set max number of concurrent locks.
     *
     * @public
     * @param {number} newMax
     */
    setMax(newMax) {
        this.maxCount = newMax;
        this.processQueue();
    }
    /**
     * Purge all waiting promises.
     *
     * @public
     * @returns {number}
     */
    purge() {
        const unresolved = this.waiting.length;
        for (const waiter of this.waiting) {
            waiter.reject("Task has been purged");
        }
        this.counter = 0;
        this.waiting = [];
        return unresolved;
    }
    /**
     * Internal process queue.
     *
     * @private
     */
    processQueue() {
        if (this.waiting.length > 0 && this.counter < this.maxCount) {
            this.counter++;
            const waiter = this.waiting.shift();
            if (waiter) {
                waiter.resolve();
            }
        }
    }
}
export default Semaphore;
//# sourceMappingURL=semaphore.js.map