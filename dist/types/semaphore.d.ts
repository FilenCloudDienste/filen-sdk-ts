/**
 * Semaphore
 *
 * @export
 * @class Semaphore
 * @typedef {Semaphore}
 */
export declare class Semaphore {
    private counter;
    private waiting;
    private maxCount;
    /**
     * Creates an instance of Semaphore.
     *
     * @constructor
     * @public
     * @param {number} [max=1]
     */
    constructor(max?: number);
    /**
     * Acquire a lock.
     *
     * @public
     * @returns {Promise<void>}
     */
    acquire(): Promise<void>;
    /**
     * Release a lock.
     *
     * @public
     */
    release(): void;
    /**
     * Returns the locks in the queue.
     *
     * @public
     * @returns {number}
     */
    count(): number;
    /**
     * Set max number of concurrent locks.
     *
     * @public
     * @param {number} newMax
     */
    setMax(newMax: number): void;
    /**
     * Purge all waiting promises.
     *
     * @public
     * @returns {number}
     */
    purge(): number;
    /**
     * Internal process queue.
     *
     * @private
     */
    private processQueue;
}
export default Semaphore;
