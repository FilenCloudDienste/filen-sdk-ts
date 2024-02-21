"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FS = void 0;
const path_1 = __importDefault(require("path"));
const errors_1 = require("./errors");
const constants_1 = require("../constants");
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils_1 = require("../utils");
const os_1 = __importDefault(require("os"));
/**
 * FS
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class FS
 * @typedef {FS}
 */
class FS {
    /**
     * Creates an instance of FS.
     * @date 2/9/2024 - 5:54:11 AM
     *
     * @constructor
     * @public
     * @param {FSConfig} params
     */
    constructor(params) {
        this.api = params.api;
        this.crypto = params.crypto;
        this.sdkConfig = params.sdkConfig;
        this.cloud = params.cloud;
        this._items = {
            "/": {
                uuid: this.sdkConfig.baseFolderUUID,
                type: "directory",
                metadata: {
                    name: "Cloud Drive"
                }
            }
        };
    }
    /**
     * Normalizes a path to be used with FS.
     * @date 2/14/2024 - 12:50:52 AM
     *
     * @private
     * @param {{ path: string }} param0
     * @param {string} param0.path
     * @returns {string}
     */
    normalizePath({ path }) {
        path = path_1.default.posix.normalize(path.trim());
        if (path.endsWith("/")) {
            path = path.substring(0, path.length - 1);
        }
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        return path;
    }
    async pathToItemUUID({ path, type }) {
        path = this.normalizePath({ path });
        const acceptedTypes = !type ? ["directory", "file"] : type === "directory" ? ["directory"] : ["file"];
        if (path === "/") {
            return this.sdkConfig.baseFolderUUID;
        }
        if (this._items[path]) {
            return this._items[path].uuid;
        }
        const pathEx = path.split("/");
        let builtPath = "/";
        for (const part of pathEx) {
            if (pathEx.length <= 0) {
                continue;
            }
            builtPath = path_1.default.posix.join(builtPath, part);
            if (this._items[builtPath] && builtPath === path && acceptedTypes.includes(this._items[builtPath].type)) {
                return this._items[builtPath].uuid;
            }
            const parentDirname = path_1.default.posix.dirname(builtPath);
            if (this._items[parentDirname]) {
                await this.readdir({ path: parentDirname });
            }
            if (this._items[builtPath] && builtPath === path && acceptedTypes.includes(this._items[builtPath].type)) {
                return this._items[builtPath].uuid;
            }
        }
        if (this._items[builtPath] && builtPath === path && acceptedTypes.includes(this._items[builtPath].type)) {
            return this._items[builtPath].uuid;
        }
        return null;
    }
    /**
     * List files and directories at path.
     * @date 2/20/2024 - 2:40:03 AM
     *
     * @public
     * @async
     * @param {{ path: string, recursive?: boolean }} param0
     * @param {string} param0.path
     * @param {boolean} [param0.recursive=false]
     * @returns {Promise<string[]>}
     */
    async readdir({ path, recursive = false }) {
        path = this.normalizePath({ path });
        const uuid = await this.pathToItemUUID({ path });
        if (!uuid) {
            return [];
        }
        if (uuid !== this.sdkConfig.baseFolderUUID) {
            const present = await this.api.v3().dir().present({ uuid });
            if (!present.present) {
                return [];
            }
        }
        const names = [];
        if (recursive) {
            const tree = await this.cloud.getDirectoryTree({ uuid });
            for (const entry in tree) {
                const item = tree[entry];
                const entryPath = entry.startsWith("/") ? entry.substring(1) : entry;
                if (item.parent === "base") {
                    continue;
                }
                const itemPath = path_1.default.posix.join(path, entryPath);
                names.push(entryPath);
                if (item.type === "directory") {
                    this._items[itemPath] = {
                        uuid: item.uuid,
                        type: "directory",
                        metadata: {
                            name: item.name
                        }
                    };
                }
                else {
                    this._items[itemPath] = {
                        uuid: item.uuid,
                        type: "file",
                        metadata: {
                            name: item.name,
                            size: item.size,
                            mime: item.mime,
                            key: item.key,
                            lastModified: item.lastModified,
                            chunks: item.chunks,
                            region: item.region,
                            bucket: item.bucket,
                            version: item.version
                        }
                    };
                }
            }
            return names;
        }
        const items = await this.cloud.listDirectory({ uuid });
        for (const item of items) {
            const itemPath = path_1.default.posix.join(path, item.name);
            names.push(item.name);
            if (item.type === "directory") {
                this._items[itemPath] = {
                    uuid: item.uuid,
                    type: "directory",
                    metadata: {
                        name: item.name
                    }
                };
            }
            else {
                this._items[itemPath] = {
                    uuid: item.uuid,
                    type: "file",
                    metadata: {
                        name: item.name,
                        size: item.size,
                        mime: item.mime,
                        key: item.key,
                        lastModified: item.lastModified,
                        chunks: item.chunks,
                        region: item.region,
                        bucket: item.bucket,
                        version: item.version
                    }
                };
            }
        }
        return names;
    }
    /**
     * Alias of readdir.
     * @date 2/13/2024 - 8:48:40 PM
     *
     * @public
     * @async
     * @param {...Parameters<typeof this.readdir>} params
     * @returns {ReturnType<typeof this.readdir>}
     */
    async ls(...params) {
        return await this.readdir(...params);
    }
    async stat({ path }) {
        var _a;
        path = this.normalizePath({ path });
        const uuid = await this.pathToItemUUID({ path });
        if (!uuid) {
            throw new errors_1.ENOENT({ path });
        }
        const item = this._items[path];
        if (!item) {
            throw new errors_1.ENOENT({ path });
        }
        if (item.type === "file") {
            return {
                size: item.metadata.size,
                mtimeMs: item.metadata.lastModified,
                birthtimeMs: (_a = item.metadata.creation) !== null && _a !== void 0 ? _a : 0,
                isDirectory() {
                    return false;
                },
                isFile() {
                    return true;
                },
                isSymbolicLink() {
                    return false;
                }
            };
        }
        return {
            size: 0,
            mtimeMs: 0,
            birthtimeMs: 0,
            isDirectory() {
                return true;
            },
            isFile() {
                return false;
            },
            isSymbolicLink() {
                return false;
            }
        };
    }
    /**
     * Alias of stat.
     * @date 2/13/2024 - 8:49:18 PM
     *
     * @public
     * @async
     * @param {...Parameters<typeof this.stat>} params
     * @returns {ReturnType<typeof this.stat>}
     */
    async lstat(...params) {
        return await this.stat(...params);
    }
    /**
     * Creates a directory at path. Recursively creates intermediate directories if they don't exist.
     * @date 2/14/2024 - 1:34:11 AM
     *
     * @public
     * @async
     * @param {{ path: string }} param0
     * @param {string} param0.path
     * @returns {Promise<void>}
     */
    async mkdir({ path }) {
        path = this.normalizePath({ path });
        if (path === "/") {
            return;
        }
        const exists = await this.pathToItemUUID({ path });
        if (exists) {
            return;
        }
        const parentPath = path_1.default.posix.dirname(path);
        const basename = path_1.default.posix.basename(path);
        if (parentPath === "/" || parentPath === "." || parentPath === "") {
            const uuid = await this.cloud.createDirectory({ name: basename, parent: this.sdkConfig.baseFolderUUID });
            this._items[path] = {
                uuid,
                type: "directory",
                metadata: {
                    name: basename
                }
            };
            return;
        }
        const pathEx = path.split("/");
        let builtPath = "/";
        for (const part of pathEx) {
            if (pathEx.length <= 0) {
                continue;
            }
            builtPath = path_1.default.posix.join(builtPath, part);
            if (!this._items[builtPath]) {
                const partBasename = path_1.default.posix.basename(builtPath);
                const partParentPath = path_1.default.posix.dirname(builtPath);
                const parentItem = this._items[partParentPath];
                if (!parentItem) {
                    continue;
                }
                const parentIsBase = partParentPath === "/" || partParentPath === "." || partParentPath === "";
                const parentUUID = parentIsBase ? this.sdkConfig.baseFolderUUID : parentItem.uuid;
                const uuid = await this.cloud.createDirectory({ name: partBasename, parent: parentUUID });
                this._items[builtPath] = {
                    uuid,
                    type: "directory",
                    metadata: {
                        name: partBasename
                    }
                };
            }
        }
        if (!this._items[path]) {
            throw new errors_1.ENOENT({ path });
        }
    }
    /**
     * Rename or move a file/directory. Recursively creates intermediate directories if needed.
     * @date 2/14/2024 - 1:39:32 AM
     *
     * @public
     * @async
     * @param {{ from: string; to: string }} param0
     * @param {string} param0.from
     * @param {string} param0.to
     * @returns {Promise<void>}
     */
    async rename({ from, to }) {
        from = this.normalizePath({ path: from });
        to = this.normalizePath({ path: to });
        if (from === "/" || from === to) {
            return;
        }
        const uuid = await this.pathToItemUUID({ path: from });
        const item = this._items[from];
        if (!uuid || !item) {
            throw new errors_1.ENOENT({ path: from });
        }
        const currentParentPath = path_1.default.posix.dirname(from);
        const newParentPath = path_1.default.posix.dirname(to);
        const newBasename = path_1.default.posix.basename(to);
        const oldBasename = path_1.default.posix.basename(from);
        if (newParentPath === currentParentPath) {
            if (to === "/" || newBasename.length <= 0) {
                return;
            }
            if (item.type === "directory") {
                await this.cloud.renameDirectory({ uuid, name: newBasename });
            }
            else {
                await this.cloud.renameFile({
                    uuid,
                    metadata: Object.assign(Object.assign({}, item.metadata), { name: newBasename }),
                    name: newBasename
                });
            }
        }
        else {
            if (oldBasename !== newBasename) {
                if (item.type === "directory") {
                    await this.cloud.renameDirectory({ uuid, name: newBasename });
                }
                else {
                    await this.cloud.renameFile({
                        uuid,
                        metadata: Object.assign(Object.assign({}, item.metadata), { name: newBasename }),
                        name: newBasename
                    });
                }
            }
            if (newParentPath === "/" || newParentPath === "." || newParentPath === "") {
                if (item.type === "directory") {
                    await this.cloud.moveDirectory({ uuid, to: this.sdkConfig.baseFolderUUID, metadata: item.metadata });
                }
                else {
                    await this.cloud.moveFile({ uuid, to: this.sdkConfig.baseFolderUUID, metadata: item.metadata });
                }
            }
            else {
                await this.mkdir({ path: newParentPath });
                const newParentItem = this._items[newParentPath];
                if (!newParentItem) {
                    throw new errors_1.ENOENT({ path: newParentPath });
                }
                if (item.type === "directory") {
                    await this.cloud.moveDirectory({ uuid, to: newParentItem.uuid, metadata: item.metadata });
                }
                else {
                    await this.cloud.moveFile({ uuid, to: newParentItem.uuid, metadata: item.metadata });
                }
            }
        }
        this._items[to] = this._items[from];
        delete this._items[from];
    }
    /**
     * Returns filesystem information.
     * @date 2/14/2024 - 2:13:19 AM
     *
     * @public
     * @async
     * @returns {Promise<StatFS>}
     */
    async statfs() {
        const account = await this.api.v3().user().account();
        return {
            type: -1,
            bsize: constants_1.BUFFER_SIZE,
            blocks: Infinity,
            bfree: Infinity,
            bavail: Infinity,
            files: -1,
            used: account.storage,
            max: account.maxStorage,
            ffree: Infinity
        };
    }
    /**
     * Deletes file/directoy at path (Sends it to the trash).
     * @date 2/14/2024 - 2:16:42 AM
     *
     * @private
     * @async
     * @param {{ path: string }} param0
     * @param {string} param0.path
     * @returns {Promise<void>}
     */
    async _unlink({ path, type }) {
        path = this.normalizePath({ path });
        const uuid = await this.pathToItemUUID({ path });
        if (!uuid || !this._items[path]) {
            throw new errors_1.ENOENT({ path });
        }
        const acceptedTypes = !type ? ["directory", "file"] : type === "directory" ? ["directory"] : ["file"];
        if (!acceptedTypes.includes(this._items[path].type)) {
            throw new errors_1.ENOENT({ path });
        }
        if (this._items[path].type === "directory") {
            await this.cloud.trashDirectory({ uuid });
        }
        else {
            await this.cloud.trashFile({ uuid });
        }
        delete this._items[path];
    }
    /**
     * Deletes file/directory at path (Sends it to the trash).
     * @date 2/14/2024 - 2:55:28 AM
     *
     * @public
     * @async
     * @param {{path: string}} param0
     * @param {string} param0.path
     * @returns {ReturnType<typeof this._unlink>}
     */
    async unlink({ path }) {
        return await this._unlink({ path });
    }
    /**
     * Alias of unlink.
     * @date 2/14/2024 - 2:55:33 AM
     *
     * @public
     * @async
     * @param {{path: string}} param0
     * @param {string} param0.path
     * @returns {ReturnType<typeof this._unlink>}
     */
    async rm({ path }) {
        return await this._unlink({ path });
    }
    /**
     * Deletes directory at path (Sends it to the trash).
     * @date 2/14/2024 - 2:53:48 AM
     *
     * @public
     * @async
     * @param {...Parameters<typeof this.unlink>} params
     * @returns {ReturnType<typeof this.unlink>}
     */
    async rmdir(...params) {
        return await this._unlink({ path: params[0].path, type: "directory" });
    }
    /**
     * Read a file. Returns buffer of given length, at position and offset. Memory efficient to read only a small part of a file.
     * @date 2/20/2024 - 9:44:16 PM
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		offset: number
     * 		length: number
     * 		position: number
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 	}} param0
     * @param {string} param0.path
     * @param {number} param0.offset
     * @param {number} param0.length
     * @param {number} param0.position
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.onProgress
     * @returns {Promise<Buffer>}
     */
    async read({ path, offset, length, position, abortSignal, pauseSignal, onProgress }) {
        path = this.normalizePath({ path });
        const uuid = await this.pathToItemUUID({ path });
        const item = this._items[path];
        if (!uuid || !item || item.type === "directory") {
            throw new errors_1.ENOENT({ path });
        }
        const chunksStart = Math.floor(position / constants_1.UPLOAD_CHUNK_SIZE);
        const chunksEnd = Math.ceil((position + length) / constants_1.UPLOAD_CHUNK_SIZE) - 1;
        if (chunksStart <= 0 || chunksStart > item.metadata.chunks || chunksEnd <= 0 || chunksEnd > item.metadata.chunks) {
            throw new Error("Invalid position or length.");
        }
        const stream = await this.cloud.downloadFileToReadableStream({
            uuid: uuid,
            bucket: item.metadata.bucket,
            region: item.metadata.region,
            chunks: item.metadata.chunks,
            version: item.metadata.version,
            key: item.metadata.key,
            abortSignal,
            pauseSignal,
            onProgress,
            chunksStart,
            chunksEnd
        });
        let buffer = Buffer.from([]);
        const reader = stream.getReader();
        let doneReading = false;
        let bytesRead = 0;
        while (!doneReading) {
            const { done, value } = await reader.read();
            if (done) {
                doneReading = true;
                break;
            }
            if (value instanceof Uint8Array && value.byteLength > 0) {
                const chunkOffset = bytesRead - position;
                const start = Math.max(0, position - bytesRead);
                const end = Math.min(start + length, value.byteLength);
                if (chunkOffset < length && end > start) {
                    const relevantPart = value.subarray(start, end);
                    buffer = Buffer.concat([buffer, relevantPart]);
                    length -= relevantPart.byteLength;
                }
                bytesRead += value.byteLength;
            }
        }
        return buffer.subarray(offset, offset + Math.min(buffer.length, length));
    }
    /**
     * Alias of writeFile.
     * @date 2/20/2024 - 9:45:40 PM
     *
     * @public
     * @async
     * @param {...Parameters<typeof this.writeFile>} params
     * @returns {ReturnType<typeof this.writeFile>}
     */
    async write(...params) {
        return await this.writeFile(...params);
    }
    /**
     * Read a file at path. Warning: This reads the whole file into memory and can be pretty inefficient.
     * @date 2/16/2024 - 5:32:31 AM
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 	}} param0
     * @param {string} param0.path
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.onProgress
     * @returns {Promise<Buffer>}
     */
    async readFile({ path, abortSignal, pauseSignal, onProgress }) {
        path = this.normalizePath({ path });
        const uuid = await this.pathToItemUUID({ path });
        const item = this._items[path];
        if (!uuid || !item || item.type === "directory") {
            throw new errors_1.ENOENT({ path });
        }
        const stream = await this.cloud.downloadFileToReadableStream({
            uuid: uuid,
            bucket: item.metadata.bucket,
            region: item.metadata.region,
            chunks: item.metadata.chunks,
            version: item.metadata.version,
            key: item.metadata.key,
            abortSignal,
            pauseSignal,
            onProgress
        });
        let buffer = Buffer.from([]);
        const reader = stream.getReader();
        let doneReading = false;
        while (!doneReading) {
            const { done, value } = await reader.read();
            if (done) {
                doneReading = true;
                break;
            }
            if (value instanceof Uint8Array && value.byteLength > 0) {
                buffer = Buffer.concat([buffer, value]);
            }
        }
        return buffer;
    }
    /**
     * Write to a file. Warning: This reads the whole file into memory and can be very inefficient. Only available in a Node.JS environment.
     * @date 2/16/2024 - 5:36:19 AM
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		content: Buffer
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 	}} param0
     * @param {string} param0.path
     * @param {Buffer} param0.content
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.onProgress
     * @returns {Promise<void>}
     */
    async writeFile({ path, content, abortSignal, pauseSignal, onProgress }) {
        if (constants_1.environment !== "node") {
            throw new Error(`fs.writeFile is not implemented for a ${constants_1.environment} environment`);
        }
        path = this.normalizePath({ path });
        const parentPath = path_1.default.posix.dirname(path);
        let parentUUID = "";
        if (parentPath === "/" || parentPath === "." || parentPath === "") {
            parentUUID = this.sdkConfig.baseFolderUUID;
        }
        else {
            await this.mkdir({ path: parentPath });
            const parentItemUUID = await this.pathToItemUUID({ path: parentPath, type: "directory" });
            const parentItem = this._items[parentPath];
            if (!parentItemUUID || !parentItem) {
                throw new Error(`Could not find parent for path ${path}`);
            }
            parentUUID = parentItem.uuid;
        }
        const tmpDir = this.sdkConfig.tmpPath ? this.sdkConfig.tmpPath : os_1.default.tmpdir();
        const tmpFilePath = path_1.default.join(tmpDir, "filen-sdk", await (0, utils_1.uuidv4)());
        await fs_extra_1.default.rm(tmpFilePath, {
            force: true,
            maxRetries: 60 * 10,
            recursive: true,
            retryDelay: 100
        });
        await fs_extra_1.default.writeFile(tmpFilePath, content);
        try {
            await this.cloud.uploadLocalFile({ source: tmpFilePath, parent: parentUUID, abortSignal, pauseSignal, onProgress });
        }
        finally {
            await fs_extra_1.default.rm(tmpFilePath, {
                force: true,
                maxRetries: 60 * 10,
                recursive: true,
                retryDelay: 100
            });
        }
    }
    /**
     * Download a file from path to a local destination path. Only available in a Node.JS environment.
     * @date 2/15/2024 - 5:59:23 AM
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		destination: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal,
     * 		onProgress?: ProgressCallback
     * 	}} param0
     * @param {string} param0.path
     * @param {string} param0.destination
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.onProgress
     * @returns {Promise<void>}
     */
    async download({ path, destination, abortSignal, pauseSignal, onProgress }) {
        if (constants_1.environment !== "node") {
            throw new Error(`fs.download is not implemented for a ${constants_1.environment} environment`);
        }
        path = this.normalizePath({ path });
        destination = (0, utils_1.normalizePath)(destination);
        const uuid = await this.pathToItemUUID({ path });
        const item = this._items[path];
        if (!uuid || !item || item.type === "directory") {
            throw new errors_1.ENOENT({ path });
        }
        await this.cloud.downloadFileToLocal({
            uuid,
            bucket: item.metadata.bucket,
            region: item.metadata.region,
            chunks: item.metadata.chunks,
            version: item.metadata.version,
            key: item.metadata.key,
            to: destination,
            abortSignal,
            pauseSignal,
            onProgress
        });
    }
    /**
     * Upload a file to path from a local source path. Recursively creates intermediate directories if needed. Only available in a Node.JS environment.
     * @date 2/16/2024 - 5:32:17 AM
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		source: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 	}} param0
     * @param {string} param0.path
     * @param {string} param0.source
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.onProgress
     * @returns {Promise<void>}
     */
    async upload({ path, source, abortSignal, pauseSignal, onProgress }) {
        if (constants_1.environment !== "node") {
            throw new Error(`fs.upload is not implemented for a ${constants_1.environment} environment`);
        }
        path = this.normalizePath({ path });
        source = (0, utils_1.normalizePath)(source);
        const parentPath = path_1.default.posix.dirname(path);
        let parentUUID = "";
        if (parentPath === "/" || parentPath === "." || parentPath === "") {
            parentUUID = this.sdkConfig.baseFolderUUID;
        }
        else {
            await this.mkdir({ path: parentPath });
            const parentItemUUID = await this.pathToItemUUID({ path: parentPath, type: "directory" });
            const parentItem = this._items[parentPath];
            if (!parentItemUUID || !parentItem) {
                throw new Error(`Could not find parent for path ${path}`);
            }
            parentUUID = parentItem.uuid;
        }
        await this.cloud.uploadLocalFile({ source, parent: parentUUID, abortSignal, pauseSignal, onProgress });
    }
    /**
     * Copy a file or directory structure. Recursively creates intermediate directories if needed.
     * Warning: Can be really inefficient when copying large directory structures.
     * All files need to be downloaded first and then reuploaded due to our end to end encryption.
     * Plain copying unfortunately does not work. Only available in a Node.JS environment.
     * @date 2/14/2024 - 5:06:04 AM
     *
     * @public
     * @async
     * @param {{ from: string; to: string }} param0
     * @param {string} param0.from
     * @param {string} param0.to
     * @returns {Promise<void>}
     */
    async cp({ from, to, abortSignal, pauseSignal, onProgress }) {
        if (constants_1.environment !== "node") {
            throw new Error(`fs.cp is not implemented for a ${constants_1.environment} environment`);
        }
        from = this.normalizePath({ path: from });
        to = this.normalizePath({ path: to });
        if (from === "/" || from === to) {
            return;
        }
        const uuid = await this.pathToItemUUID({ path: from });
        const item = this._items[from];
        if (!uuid || !item) {
            throw new errors_1.ENOENT({ path: from });
        }
        const parentPath = path_1.default.posix.dirname(to);
        let parentUUID = "";
        if (parentPath === "/" || parentPath === "." || parentPath === "") {
            parentUUID = this.sdkConfig.baseFolderUUID;
        }
        else {
            await this.mkdir({ path: parentPath });
            const parentItemUUID = await this.pathToItemUUID({ path: parentPath, type: "directory" });
            const parentItem = this._items[parentPath];
            if (!parentItemUUID || !parentItem) {
                throw new Error(`Could not find parent for path ${to}`);
            }
            parentUUID = parentItem.uuid;
        }
        if (item.type === "directory") {
            const tmpDir = this.sdkConfig.tmpPath ? this.sdkConfig.tmpPath : os_1.default.tmpdir();
            const baseDirectoryName = path_1.default.posix.basename(from);
            const tmpDirectoryPath = (0, utils_1.normalizePath)(path_1.default.join(tmpDir, "filen-sdk", await (0, utils_1.uuidv4)(), baseDirectoryName));
            await this.cloud.downloadDirectoryToLocal({ uuid, to: tmpDirectoryPath });
            try {
                await this.cloud.uploadLocalDirectory({
                    source: tmpDirectoryPath,
                    parent: parentUUID,
                    abortSignal,
                    pauseSignal,
                    onProgress
                });
            }
            finally {
                await fs_extra_1.default.rm(path_1.default.join(tmpDirectoryPath, ".."), {
                    force: true,
                    maxRetries: 60 * 10,
                    recursive: true,
                    retryDelay: 100
                });
            }
        }
        else {
            const tmpFilePath = await this.cloud.downloadFileToLocal({
                uuid,
                bucket: item.metadata.bucket,
                region: item.metadata.region,
                chunks: item.metadata.chunks,
                version: item.metadata.version,
                key: item.metadata.key,
                abortSignal,
                pauseSignal,
                onProgress
            });
            try {
                await this.cloud.uploadLocalFile({ source: tmpFilePath, parent: parentUUID, abortSignal, pauseSignal, onProgress });
            }
            finally {
                await fs_extra_1.default.rm(tmpFilePath, {
                    force: true,
                    maxRetries: 60 * 10,
                    recursive: true,
                    retryDelay: 100
                });
            }
        }
    }
    /**
     * Alias of cp.
     * @date 2/14/2024 - 5:07:27 AM
     *
     * @public
     * @async
     * @param {...Parameters<typeof this.cp>} params
     * @returns {ReturnType<typeof this.cp>}
     */
    async copy(...params) {
        return await this.cp(...params);
    }
}
exports.FS = FS;
exports.default = FS;
//# sourceMappingURL=index.js.map