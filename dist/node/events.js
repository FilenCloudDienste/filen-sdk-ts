"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedEventEmitter = void 0;
const eventemitter3_1 = require("eventemitter3");
class TypedEventEmitter {
    constructor() {
        this.emitter = new eventemitter3_1.EventEmitter();
    }
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
exports.TypedEventEmitter = TypedEventEmitter;
exports.default = TypedEventEmitter;
//# sourceMappingURL=events.js.map