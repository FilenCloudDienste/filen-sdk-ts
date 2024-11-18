import { EventEmitter } from "eventemitter3"

export type Events = {
	foo: "bar"
}

export class TypedEventEmitter<T> {
	private emitter = new EventEmitter()

	public subscribe<K extends keyof T>(event: K, listener: (payload: T[K]) => void) {
		this.emitter.addListener(event as string, listener)

		return {
			remove: () => {
				this.emitter.removeListener(event as string, listener)
			}
		}
	}

	public emit<K extends keyof T>(event: K, payload: T[K]): boolean {
		return this.emitter.emit(event as string, payload)
	}

	public on<K extends keyof T>(event: K, listener: (payload: T[K]) => void): this {
		this.emitter.on(event as string, listener)

		return this
	}

	public once<K extends keyof T>(event: K, listener: (payload: T[K]) => void): this {
		this.emitter.once(event as string, listener)

		return this
	}

	public off<K extends keyof T>(event: K, listener: (payload: T[K]) => void): this {
		this.emitter.off(event as string, listener)

		return this
	}
}

export default TypedEventEmitter
