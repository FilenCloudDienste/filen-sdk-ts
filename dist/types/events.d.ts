export type Events = {
    foo: "bar";
};
export declare class TypedEventEmitter<T> {
    private emitter;
    subscribe<K extends keyof T>(event: K, listener: (payload: T[K]) => void): {
        remove: () => void;
    };
    emit<K extends keyof T>(event: K, payload: T[K]): boolean;
    on<K extends keyof T>(event: K, listener: (payload: T[K]) => void): this;
    once<K extends keyof T>(event: K, listener: (payload: T[K]) => void): this;
    off<K extends keyof T>(event: K, listener: (payload: T[K]) => void): this;
}
export default TypedEventEmitter;
