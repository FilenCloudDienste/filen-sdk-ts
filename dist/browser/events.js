import { EventEmitter } from "eventemitter3";
export class TypedEventEmitter {
    emitter = new EventEmitter();
    subscribe(event, listener) {
        this.emitter.addListener(event, listener);
        return {
            remove: () => {
                this.emitter.removeListener(event, listener);
            }
        };
    }
    emit(event, payload) {
        return this.emitter.emit(event, payload);
    }
    on(event, listener) {
        this.emitter.on(event, listener);
        return this;
    }
    once(event, listener) {
        this.emitter.once(event, listener);
        return this;
    }
    off(event, listener) {
        this.emitter.off(event, listener);
        return this;
    }
}
export default TypedEventEmitter;
//# sourceMappingURL=events.js.map