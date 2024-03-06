/**
 * PauseSignal
 * @date 2/15/2024 - 2:44:49 AM
 *
 * @export
 * @class PauseSignal
 * @typedef {PauseSignal}
 */
export class PauseSignal {
    paused;
    listeners;
    /**
     * Creates an instance of PauseSignal.
     * @date 2/15/2024 - 2:44:55 AM
     *
     * @constructor
     * @public
     */
    constructor() {
        this.paused = false;
        this.listeners = [];
    }
    /**
     * Emit pause.
     * @date 2/15/2024 - 2:44:58 AM
     *
     * @public
     */
    pause() {
        this.paused = true;
        this.listeners.forEach(listener => listener());
    }
    /**
     * Emit resume.
     * @date 2/15/2024 - 2:45:07 AM
     *
     * @public
     */
    resume() {
        this.paused = false;
    }
    /**
     * onPaused listener.
     * @date 2/15/2024 - 2:45:20 AM
     *
     * @public
     * @param {() => void} listener
     */
    onPaused(listener) {
        this.listeners.push(listener);
    }
    /**
     * isPaused check.
     * @date 2/15/2024 - 2:45:27 AM
     *
     * @public
     * @returns {boolean}
     */
    isPaused() {
        return this.paused;
    }
}
//# sourceMappingURL=signals.js.map