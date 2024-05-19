const env = {
    isBrowser: (typeof window !== "undefined" && typeof window.document !== "undefined") ||
        // @ts-expect-error WorkerEnv's are not typed
        (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) ||
        // @ts-expect-error WorkerEnv's are not typed
        (typeof ServiceWorkerGlobalScope !== "undefined" && self instanceof ServiceWorkerGlobalScope),
    isNode: typeof process !== "undefined" && process.versions !== null && process.versions.node !== null
};
export const environment = env.isBrowser ? "browser" : "node";
export const BUFFER_SIZE = 4096;
export const BASE64_BUFFER_SIZE = 3 * 1024;
export const MAX_CONCURRENT_DOWNLOADS = 32;
export const MAX_DOWNLOAD_THREADS = 128;
export const MAX_DOWNLOAD_WRITERS = 256;
export const MAX_UPLOAD_THREADS = 16;
export const CURRENT_FILE_ENCRYPTION_VERSION = 2;
export const DEFAULT_UPLOAD_REGION = "de-1";
export const DEFAULT_UPLOAD_BUCKET = "filen-1";
export const UPLOAD_CHUNK_SIZE = 1024 * 1024;
export const MAX_NOTE_SIZE = 1024 * 1024 - 1;
export const MAX_CONCURRENT_LISTING_OPS = 64;
export const MAX_CONCURRENT_UPLOADS = 8;
export const MAX_CONCURRENT_DIRECTORY_UPLOADS = 4;
export const MAX_CONCURRENT_DIRECTORY_DOWNLOADS = 8;
//# sourceMappingURL=constants.js.map