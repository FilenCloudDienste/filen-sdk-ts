import { v4 as uuidv4 } from "uuid";
import { Semaphore } from "./semaphore";
/**
 * Lock
 *
 * @export
 * @class Lock
 * @typedef {Lock}
 */
export class Lock {
    sdk;
    resource;
    lockUUID = null;
    lockRefreshInterval = undefined;
    mutex = new Semaphore(1);
    acquiredCount = 0;
    /**
     * Creates an instance of Lock.
     *
     * @constructor
     * @public
     * @param {{ sdk: FilenSDK; resource: string }} param0
     * @param {FilenSDK} param0.sdk
     * @param {string} param0.resource
     */
    constructor({ sdk, resource }) {
        this.sdk = sdk;
        this.resource = resource;
    }
    /**
     * Acquire the lock on <resource>.
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    async acquire() {
        await this.mutex.acquire();
        let didIncrement = false;
        try {
            this.acquiredCount++;
            didIncrement = true;
            if (this.acquiredCount > 1) {
                return;
            }
            clearInterval(this.lockRefreshInterval);
            if (!this.lockUUID) {
                this.lockUUID = uuidv4();
            }
            try {
                await this.sdk.user().acquireResourceLock({
                    resource: this.resource,
                    lockUUID: this.lockUUID,
                    maxTries: Infinity,
                    tryTimeout: 1000
                });
            }
            catch (err) {
                this.acquiredCount--;
                didIncrement = false;
                throw err;
            }
            this.lockRefreshInterval = setInterval(async () => {
                if (this.acquiredCount === 0 || !this.lockUUID) {
                    clearInterval(this.lockRefreshInterval);
                    return;
                }
                await this.mutex.acquire();
                try {
                    await this.sdk.user().refreshResourceLock({
                        resource: this.resource,
                        lockUUID: this.lockUUID
                    });
                }
                catch {
                    // Noop
                }
                finally {
                    this.mutex.release();
                }
            }, 15000);
        }
        catch (err) {
            if (didIncrement) {
                this.acquiredCount--;
            }
            throw err;
        }
        finally {
            this.mutex.release();
        }
    }
    /**
     * Release the acquired lock on <resource>.
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    async release() {
        await this.mutex.acquire();
        const previousCount = structuredClone(this.acquiredCount);
        try {
            if (this.acquiredCount === 0 || !this.lockUUID) {
                return;
            }
            this.acquiredCount--;
            if (this.acquiredCount > 0) {
                return;
            }
            clearInterval(this.lockRefreshInterval);
            try {
                await this.sdk.user().releaseResourceLock({
                    resource: this.resource,
                    lockUUID: this.lockUUID
                });
                this.lockUUID = null;
            }
            catch (error) {
                this.acquiredCount = previousCount;
                throw error;
            }
        }
        finally {
            this.mutex.release();
        }
    }
}
export default Lock;
//# sourceMappingURL=lock.js.map