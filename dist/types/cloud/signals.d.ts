/**
 * PauseSignal
 * @date 2/15/2024 - 2:44:49 AM
 *
 * @export
 * @class PauseSignal
 * @typedef {PauseSignal}
 */
export declare class PauseSignal {
    private paused;
    private listeners;
    /**
     * Creates an instance of PauseSignal.
     * @date 2/15/2024 - 2:44:55 AM
     *
     * @constructor
     * @public
     */
    constructor();
    /**
     * Emit pause.
     * @date 2/15/2024 - 2:44:58 AM
     *
     * @public
     */
    pause(): void;
    /**
     * Emit resume.
     * @date 2/15/2024 - 2:45:07 AM
     *
     * @public
     */
    resume(): void;
    /**
     * onPaused listener.
     * @date 2/15/2024 - 2:45:20 AM
     *
     * @public
     * @param {() => void} listener
     */
    onPaused(listener: () => void): void;
    /**
     * isPaused check.
     * @date 2/15/2024 - 2:45:27 AM
     *
     * @public
     * @returns {boolean}
     */
    isPaused(): boolean;
}
