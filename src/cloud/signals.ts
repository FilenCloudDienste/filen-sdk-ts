/**
 * PauseSignal
 * @date 2/15/2024 - 2:44:49 AM
 *
 * @export
 * @class PauseSignal
 * @typedef {PauseSignal}
 */
export class PauseSignal {
	private paused: boolean
	private listeners: Array<() => void>

	/**
	 * Creates an instance of PauseSignal.
	 * @date 2/15/2024 - 2:44:55 AM
	 *
	 * @constructor
	 * @public
	 */
	public constructor() {
		this.paused = false
		this.listeners = []
	}

	/**
	 * Emit pause.
	 * @date 2/15/2024 - 2:44:58 AM
	 *
	 * @public
	 */
	public pause(): void {
		this.paused = true

		this.listeners.forEach(listener => listener())
	}

	/**
	 * Emit resume.
	 * @date 2/15/2024 - 2:45:07 AM
	 *
	 * @public
	 */
	public resume(): void {
		this.paused = false
	}

	/**
	 * onPaused listener.
	 * @date 2/15/2024 - 2:45:20 AM
	 *
	 * @public
	 * @param {() => void} listener
	 */
	public onPaused(listener: () => void): void {
		this.listeners.push(listener)
	}

	/**
	 * isPaused check.
	 * @date 2/15/2024 - 2:45:27 AM
	 *
	 * @public
	 * @returns {boolean}
	 */
	public isPaused(): boolean {
		return this.paused
	}
}
