import type FilenSDK from ".";
/**
 * Lock
 *
 * @export
 * @class Lock
 * @typedef {Lock}
 */
export declare class Lock {
    private readonly sdk;
    private readonly resource;
    private lockUUID;
    private lockRefreshInterval;
    private mutex;
    private acquiredCount;
    /**
     * Creates an instance of Lock.
     *
     * @constructor
     * @public
     * @param {{ sdk: FilenSDK; resource: string }} param0
     * @param {FilenSDK} param0.sdk
     * @param {string} param0.resource
     */
    constructor({ sdk, resource }: {
        sdk: FilenSDK;
        resource: string;
    });
    /**
     * Acquire the lock on <resource>.
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    acquire(): Promise<void>;
    /**
     * Release the acquired lock on <resource>.
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    release(): Promise<void>;
}
export default Lock;
