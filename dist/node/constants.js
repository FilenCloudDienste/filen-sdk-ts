"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_CONCURRENT_DIRECTORY_DOWNLOADS = exports.MAX_CONCURRENT_DIRECTORY_UPLOADS = exports.MAX_CONCURRENT_UPLOADS = exports.MAX_CONCURRENT_LISTING_OPS = exports.MAX_NOTE_SIZE = exports.UPLOAD_CHUNK_SIZE = exports.DEFAULT_UPLOAD_BUCKET = exports.DEFAULT_UPLOAD_REGION = exports.CURRENT_FILE_ENCRYPTION_VERSION = exports.MAX_UPLOAD_THREADS = exports.MAX_DOWNLOAD_WRITERS = exports.MAX_DOWNLOAD_THREADS = exports.MAX_CONCURRENT_DOWNLOADS = exports.BASE64_BUFFER_SIZE = exports.BUFFER_SIZE = exports.CHUNK_SIZE = exports.environment = void 0;
const env = {
    isBrowser: (typeof window !== "undefined" && typeof window.document !== "undefined") ||
        // @ts-expect-error WorkerEnv's are not typed
        (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) ||
        // @ts-expect-error WorkerEnv's are not typed
        (typeof ServiceWorkerGlobalScope !== "undefined" && self instanceof ServiceWorkerGlobalScope),
    isNode: typeof process !== "undefined" && process.versions !== null && process.versions.node !== null
};
exports.environment = env.isBrowser ? "browser" : "node";
exports.CHUNK_SIZE = 1024 * 1024;
exports.BUFFER_SIZE = 4096;
exports.BASE64_BUFFER_SIZE = 3 * 1024;
exports.MAX_CONCURRENT_DOWNLOADS = 32;
exports.MAX_DOWNLOAD_THREADS = 128;
exports.MAX_DOWNLOAD_WRITERS = 256;
exports.MAX_UPLOAD_THREADS = 16;
exports.CURRENT_FILE_ENCRYPTION_VERSION = 2;
exports.DEFAULT_UPLOAD_REGION = "de-1";
exports.DEFAULT_UPLOAD_BUCKET = "filen-1";
exports.UPLOAD_CHUNK_SIZE = 1024 * 1024;
exports.MAX_NOTE_SIZE = 1024 * 1024 - 1;
exports.MAX_CONCURRENT_LISTING_OPS = 64;
exports.MAX_CONCURRENT_UPLOADS = 8;
exports.MAX_CONCURRENT_DIRECTORY_UPLOADS = 4;
exports.MAX_CONCURRENT_DIRECTORY_DOWNLOADS = 8;
//# sourceMappingURL=constants.js.map