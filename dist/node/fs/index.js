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
const socket_1 = require("../socket");
const semaphore_1 = require("../semaphore");
const write_file_atomic_1 = __importDefault(require("write-file-atomic"));
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
        this.socket = new socket_1.Socket();
        this.mutex = new semaphore_1.Semaphore(1);
        this.mkdirMutex = new semaphore_1.Semaphore(1);
        this.itemsMutex = new semaphore_1.Semaphore(1);
        this.api = params.api;
        this.sdkConfig = params.sdkConfig;
        this.cloud = params.cloud;
        this._items = {
            "/": {
                uuid: this.sdkConfig.baseFolderUUID,
                type: "directory",
                metadata: {
                    name: "Cloud Drive",
                    timestamp: Date.now()
                }
            }
        };
        this._uuidToItem = {
            [this.sdkConfig.baseFolderUUID]: {
                uuid: this.sdkConfig.baseFolderUUID,
                type: "directory",
                path: "/",
                metadata: {
                    name: "Cloud Drive",
                    timestamp: Date.now()
                }
            }
        };
        this._initSocketEvents(params.connectToSocket).catch(() => { });
    }
    /**
     * Wait for an API key (login) to become available
     *
     * @private
     * @async
     * @returns {Promise<string>}
     */
    async waitForValidAPIKey() {
        if (this.sdkConfig.apiKey && this.sdkConfig.apiKey.length >= 16) {
            return this.sdkConfig.apiKey;
        }
        return await new Promise(resolve => {
            const interval = setInterval(() => {
                if (this.sdkConfig.apiKey && this.sdkConfig.apiKey.length >= 16) {
                    clearInterval(interval);
                    resolve(this.sdkConfig.apiKey);
                }
            }, 250);
        });
    }
    /**
     * Attach listeners for relevant realtime events.
     *
     * @private
     * @async
     * @param {?boolean} [connect]
     * @returns {Promise<void>}
     */
    async _initSocketEvents(connect) {
        if (!connect) {
            return;
        }
        const apiKey = await this.waitForValidAPIKey();
        this.socket.connect({ apiKey });
        this.socket.addListener("socketEvent", async (event) => {
            await this.itemsMutex.acquire();
            try {
                if (event.type === "fileArchiveRestored") {
                    const currentItem = this._uuidToItem[event.data.currentUUID];
                    const item = this._uuidToItem[event.data.uuid];
                    if (currentItem) {
                        delete this._items[currentItem.path];
                        delete this._uuidToItem[event.data.currentUUID];
                    }
                    if (item) {
                        delete this._items[item.path];
                        delete this._uuidToItem[event.data.uuid];
                    }
                }
                else if (event.type === "fileRename") {
                    const item = this._uuidToItem[event.data.uuid];
                    if (item) {
                        delete this._items[item.path];
                        delete this._uuidToItem[event.data.uuid];
                    }
                }
                else if (event.type === "fileMove") {
                    const item = this._uuidToItem[event.data.uuid];
                    if (item) {
                        delete this._items[item.path];
                        delete this._uuidToItem[event.data.uuid];
                    }
                }
                else if (event.type === "fileTrash") {
                    const item = this._uuidToItem[event.data.uuid];
                    if (item) {
                        delete this._items[item.path];
                        delete this._uuidToItem[event.data.uuid];
                    }
                }
                else if (event.type === "fileArchived") {
                    const item = this._uuidToItem[event.data.uuid];
                    if (item) {
                        delete this._items[item.path];
                        delete this._uuidToItem[event.data.uuid];
                    }
                }
                else if (event.type === "folderTrash") {
                    const item = this._uuidToItem[event.data.uuid];
                    if (item) {
                        for (const path in this._items) {
                            if (path.startsWith(item.path + "/") || item.path === path) {
                                const oldItem = this._items[path];
                                if (oldItem) {
                                    delete this._uuidToItem[oldItem.uuid];
                                }
                                delete this._items[path];
                            }
                        }
                        delete this._items[item.path];
                        delete this._uuidToItem[event.data.uuid];
                    }
                }
                else if (event.type === "fileDeletedPermanent") {
                    const item = this._uuidToItem[event.data.uuid];
                    if (item) {
                        delete this._items[item.path];
                        delete this._uuidToItem[event.data.uuid];
                    }
                }
                else if (event.type === "folderMove") {
                    const item = this._uuidToItem[event.data.uuid];
                    if (item) {
                        for (const path in this._items) {
                            if (path.startsWith(item.path + "/") || item.path === path) {
                                const oldItem = this._items[path];
                                if (oldItem) {
                                    delete this._uuidToItem[oldItem.uuid];
                                }
                                delete this._items[path];
                            }
                        }
                        delete this._items[item.path];
                        delete this._uuidToItem[event.data.uuid];
                    }
                }
                else if (event.type === "folderRename") {
                    const item = this._uuidToItem[event.data.uuid];
                    if (item) {
                        for (const path in this._items) {
                            if (path.startsWith(item.path + "/") || item.path === path) {
                                const oldItem = this._items[path];
                                if (oldItem) {
                                    delete this._uuidToItem[oldItem.uuid];
                                }
                                delete this._items[path];
                            }
                        }
                        delete this._items[item.path];
                        delete this._uuidToItem[event.data.uuid];
                    }
                }
                else if (event.type === "passwordChanged") {
                    this._items = {};
                    this._uuidToItem = {};
                }
            }
            catch (_a) {
                // Noop
            }
            finally {
                this.itemsMutex.release();
            }
        });
    }
    /**
     * Add an item to the internal item tree.
     *
     * @public
     * @async
     * @param {{ path: string; item: FSItem }} param0
     * @param {string} param0.path
     * @param {(Prettify<(FSItemBase & { type: "directory"; metadata: FolderMetadata; }) | (FSItemBase & { type: "file"; metadata: Prettify<any>; })>)} param0.item
     * @returns {Promise<void>}
     */
    async _addItem({ path, item }) {
        await this.itemsMutex.acquire();
        this._items[path] = item;
        this._uuidToItem[item.uuid] = Object.assign(Object.assign({}, item), { path });
        this.itemsMutex.release();
    }
    /**
     * Remove an item from the internal item tree.
     *
     * @public
     * @async
     * @param {{ path: string }} param0
     * @param {string} param0.path
     * @returns {Promise<void>}
     */
    async _removeItem({ path }) {
        await this.itemsMutex.acquire();
        for (const entry in this._items) {
            if (entry.startsWith(path + "/") || entry === path) {
                const item = this._items[entry];
                if (item) {
                    delete this._uuidToItem[item.uuid];
                }
                delete this._items[entry];
            }
        }
        this.itemsMutex.release();
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
        path = path_1.default.posix.normalize(path);
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
        const item = this._items[path];
        if (item && acceptedTypes.includes(item.type)) {
            return item.uuid;
        }
        const pathEx = path.split("/");
        let builtPath = "/";
        for (const part of pathEx) {
            if (pathEx.length <= 0) {
                continue;
            }
            builtPath = path_1.default.posix.join(builtPath, part);
            const parentDirname = path_1.default.posix.dirname(builtPath);
            const parentItem = this._items[parentDirname];
            if (!parentItem) {
                return null;
            }
            const content = await this.cloud.listDirectory({ uuid: parentItem.uuid });
            let foundUUID = "";
            let foundType = null;
            for (const item of content) {
                const itemPath = path_1.default.posix.join(parentDirname, item.name);
                if (itemPath === path) {
                    foundUUID = item.uuid;
                    foundType = item.type;
                }
                await this.itemsMutex.acquire();
                if (item.type === "directory") {
                    this._items[itemPath] = {
                        uuid: item.uuid,
                        type: "directory",
                        metadata: {
                            name: item.name,
                            timestamp: item.timestamp
                        }
                    };
                    this._uuidToItem[item.uuid] = {
                        uuid: item.uuid,
                        type: "directory",
                        path: itemPath,
                        metadata: {
                            name: item.name,
                            timestamp: item.timestamp
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
                    this._uuidToItem[item.uuid] = {
                        uuid: item.uuid,
                        type: "file",
                        path: itemPath,
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
                this.itemsMutex.release();
            }
            if (foundType && foundUUID.length > 0 && acceptedTypes.includes(foundType)) {
                return foundUUID;
            }
        }
        const foundItem = this._items[path];
        if (foundItem && acceptedTypes.includes(foundItem.type)) {
            return foundItem.uuid;
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
        const uuid = await this.pathToItemUUID({
            path,
            type: "directory"
        });
        if (!uuid) {
            throw new errors_1.ENOENT({ path });
        }
        const names = [];
        const existingPaths = {};
        if (recursive) {
            const tree = await this.cloud.getDirectoryTree({ uuid });
            for (const entry in tree) {
                const item = tree[entry];
                const entryPath = entry.startsWith("/") ? entry.substring(1) : entry;
                const lowercasePath = entryPath.toLowerCase();
                if (!item || item.parent === "base" || existingPaths[lowercasePath]) {
                    continue;
                }
                existingPaths[lowercasePath] = true;
                const itemPath = path_1.default.posix.join(path, entryPath);
                names.push(entryPath);
                await this.itemsMutex.acquire();
                if (item.type === "directory") {
                    this._items[itemPath] = {
                        uuid: item.uuid,
                        type: "directory",
                        metadata: {
                            name: item.name,
                            timestamp: item.timestamp
                        }
                    };
                    this._uuidToItem[item.uuid] = {
                        uuid: item.uuid,
                        type: "directory",
                        path: itemPath,
                        metadata: {
                            name: item.name,
                            timestamp: item.timestamp
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
                    this._uuidToItem[item.uuid] = {
                        uuid: item.uuid,
                        type: "file",
                        path: itemPath,
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
                this.itemsMutex.release();
            }
            return names.sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
        }
        const items = (await this.cloud.listDirectory({ uuid })).sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
        for (const item of items) {
            const itemPath = path_1.default.posix.join(path, item.name);
            const lowercasePath = itemPath.toLowerCase();
            if (existingPaths[lowercasePath]) {
                continue;
            }
            existingPaths[lowercasePath] = true;
            names.push(item.name);
            await this.itemsMutex.acquire();
            if (item.type === "directory") {
                this._items[itemPath] = {
                    uuid: item.uuid,
                    type: "directory",
                    metadata: {
                        name: item.name,
                        timestamp: item.timestamp
                    }
                };
                this._uuidToItem[item.uuid] = {
                    uuid: item.uuid,
                    type: "directory",
                    path: itemPath,
                    metadata: {
                        name: item.name,
                        timestamp: item.timestamp
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
                this._uuidToItem[item.uuid] = {
                    uuid: item.uuid,
                    type: "file",
                    path: itemPath,
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
            this.itemsMutex.release();
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
     * @returns {Promise<string[]>}
     */
    async ls(...params) {
        return await this.readdir(...params);
    }
    async stat({ path }) {
        var _a, _b, _c;
        path = this.normalizePath({ path });
        const uuid = await this.pathToItemUUID({ path });
        const item = this._items[path];
        if (!uuid || !item) {
            throw new errors_1.ENOENT({ path });
        }
        const now = Date.now();
        if (item.type === "file") {
            return Object.assign(Object.assign({}, item.metadata), { uuid, size: item.metadata.size, mtimeMs: item.metadata.lastModified, birthtimeMs: (_a = item.metadata.creation) !== null && _a !== void 0 ? _a : now, type: "file", isDirectory() {
                    return false;
                },
                isFile() {
                    return true;
                } });
        }
        return {
            name: item.metadata.name,
            uuid,
            size: 0,
            mtimeMs: (_b = item.metadata.timestamp) !== null && _b !== void 0 ? _b : now,
            birthtimeMs: (_c = item.metadata.timestamp) !== null && _c !== void 0 ? _c : now,
            type: "directory",
            isDirectory() {
                return true;
            },
            isFile() {
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
     * @returns {Promise<FSStats>}
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
     * @returns {Promise<string>}
     */
    async mkdir({ path }) {
        await this.mkdirMutex.acquire();
        try {
            path = this.normalizePath({ path });
            if (path === "/") {
                return this.sdkConfig.baseFolderUUID;
            }
            const exists = await this.pathToItemUUID({ path });
            if (exists) {
                return exists;
            }
            const parentPath = path_1.default.posix.dirname(path);
            const basename = path_1.default.posix.basename(path);
            if (parentPath === "/" || parentPath === "." || parentPath === "") {
                const uuid = await this.cloud.createDirectory({ name: basename, parent: this.sdkConfig.baseFolderUUID });
                await this.itemsMutex.acquire();
                this._items[path] = {
                    uuid,
                    type: "directory",
                    metadata: {
                        name: basename,
                        timestamp: Date.now()
                    }
                };
                this._uuidToItem[uuid] = {
                    uuid,
                    type: "directory",
                    path,
                    metadata: {
                        name: basename,
                        timestamp: Date.now()
                    }
                };
                this.itemsMutex.release();
                return uuid;
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
                    const uuid = await this.cloud.createDirectory({
                        name: partBasename,
                        parent: parentUUID
                    });
                    await this.itemsMutex.acquire();
                    this._items[builtPath] = {
                        uuid,
                        type: "directory",
                        metadata: {
                            name: partBasename,
                            timestamp: Date.now()
                        }
                    };
                    this._uuidToItem[uuid] = {
                        uuid,
                        type: "directory",
                        path: builtPath,
                        metadata: {
                            name: partBasename,
                            timestamp: Date.now()
                        }
                    };
                    this.itemsMutex.release();
                }
            }
            const item = this._items[path];
            if (!item || !this._items[path]) {
                throw new errors_1.ENOENT({ path });
            }
            return item.uuid;
        }
        finally {
            this.mkdirMutex.release();
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
        await this.mutex.acquire();
        try {
            from = this.normalizePath({ path: from });
            to = this.normalizePath({ path: to });
            if (from === "/" || from === to) {
                return;
            }
            const uuid = await this.pathToItemUUID({ path: from });
            const item = this._items[from];
            if (!uuid || !item || (item.type === "file" && item.metadata.key.length === 0)) {
                throw new errors_1.ENOENT({ path: from });
            }
            const currentParentPath = path_1.default.posix.dirname(from);
            const newParentPath = path_1.default.posix.dirname(to);
            const newBasename = path_1.default.posix.basename(to);
            const oldBasename = path_1.default.posix.basename(from);
            const itemMetadata = item.type === "file"
                ? ({
                    name: newBasename,
                    size: item.metadata.size,
                    mime: item.metadata.mime,
                    lastModified: item.metadata.lastModified,
                    creation: item.metadata.creation,
                    hash: item.metadata.hash,
                    key: item.metadata.key,
                    chunks: item.metadata.chunks,
                    region: item.metadata.region,
                    bucket: item.metadata.bucket,
                    version: item.metadata.version
                })
                : ({
                    name: newBasename
                });
            if (newParentPath === currentParentPath) {
                if (to === "/" || newBasename.length <= 0) {
                    return;
                }
                if (item.type === "directory") {
                    await this.cloud.renameDirectory({
                        uuid,
                        name: newBasename
                    });
                }
                else {
                    await this.cloud.renameFile({
                        uuid,
                        metadata: itemMetadata,
                        name: newBasename
                    });
                }
            }
            else {
                if (to.startsWith(from + "/")) {
                    return;
                }
                if (oldBasename !== newBasename) {
                    if (item.type === "directory") {
                        await this.cloud.renameDirectory({
                            uuid,
                            name: newBasename
                        });
                    }
                    else {
                        await this.cloud.renameFile({
                            uuid,
                            metadata: itemMetadata,
                            name: newBasename
                        });
                    }
                }
                if (newParentPath === "/" || newParentPath === "." || newParentPath === "") {
                    if (item.type === "directory") {
                        await this.cloud.moveDirectory({
                            uuid,
                            to: this.sdkConfig.baseFolderUUID,
                            metadata: itemMetadata
                        });
                    }
                    else {
                        await this.cloud.moveFile({
                            uuid,
                            to: this.sdkConfig.baseFolderUUID,
                            metadata: itemMetadata
                        });
                    }
                }
                else {
                    await this.mkdir({ path: newParentPath });
                    const newParentItem = this._items[newParentPath];
                    if (!newParentItem) {
                        throw new errors_1.ENOENT({ path: newParentPath });
                    }
                    if (item.type === "directory") {
                        await this.cloud.moveDirectory({
                            uuid,
                            to: newParentItem.uuid,
                            metadata: itemMetadata
                        });
                    }
                    else {
                        await this.cloud.moveFile({
                            uuid,
                            to: newParentItem.uuid,
                            metadata: itemMetadata
                        });
                    }
                }
            }
            await this.itemsMutex.acquire();
            this._items[to] = Object.assign(Object.assign({}, this._items[from]), { metadata: itemMetadata });
            this._uuidToItem[item.uuid] = Object.assign(Object.assign({}, this._uuidToItem[item.uuid]), { path: to, metadata: itemMetadata });
            delete this._items[from];
            if (item.type === "directory") {
                for (const oldPath in this._items) {
                    if (oldPath.startsWith(from + "/") && oldPath !== from) {
                        const newPath = (0, utils_1.replacePathStartWithFromAndTo)(oldPath, from, to);
                        const oldItem = this._items[oldPath];
                        if (oldItem) {
                            this._items[newPath] = oldItem;
                            delete this._items[oldPath];
                            const oldItemUUID = this._uuidToItem[oldItem.uuid];
                            if (oldItemUUID) {
                                this._uuidToItem[oldItem.uuid] = Object.assign(Object.assign({}, oldItemUUID), { path: newPath });
                            }
                        }
                    }
                }
            }
            this.itemsMutex.release();
        }
        finally {
            this.mutex.release();
        }
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
     * Deletes file/directoy at path.
     * @date 2/28/2024 - 4:57:19 PM
     *
     * @private
     * @async
     * @param {{ path: string; type?: FSItemType, permanent?: boolean }} param0
     * @param {string} param0.path
     * @param {FSItemType} param0.type
     * @param {boolean} [param0.permanent=false]
     * @returns {Promise<void>}
     */
    async _unlink({ path, type, permanent = false }) {
        await this.mutex.acquire();
        try {
            path = this.normalizePath({ path });
            const uuid = await this.pathToItemUUID({ path });
            const item = this._items[path];
            if (!uuid || !item) {
                return;
            }
            const acceptedTypes = !type ? ["directory", "file"] : type === "directory" ? ["directory"] : ["file"];
            if (!acceptedTypes.includes(item.type)) {
                return;
            }
            if (item.type === "directory") {
                if (permanent) {
                    await this.cloud.deleteDirectory({ uuid });
                }
                else {
                    await this.cloud.trashDirectory({ uuid });
                }
            }
            else {
                if (permanent) {
                    await this.cloud.deleteFile({ uuid });
                }
                else {
                    await this.cloud.trashFile({ uuid });
                }
            }
            await this.itemsMutex.acquire();
            delete this._uuidToItem[item.uuid];
            delete this._items[path];
            for (const entry in this._items) {
                if (entry.startsWith(path + "/") || entry === path) {
                    const entryItem = this._items[entry];
                    if (entryItem) {
                        delete this._uuidToItem[entryItem.uuid];
                    }
                    delete this._items[entry];
                }
            }
            this.itemsMutex.release();
        }
        finally {
            this.mutex.release();
        }
    }
    /**
     * Deletes file/directory at path.
     * @date 2/28/2024 - 4:58:37 PM
     *
     * @public
     * @async
     * @param {{ path: string, permanent?: boolean }} param0
     * @param {string} param0.path
     * @param {boolean} [param0.permanent=false]
     * @returns {Promise<void>}
     */
    async unlink({ path, permanent = false }) {
        return await this._unlink({
            path,
            permanent
        });
    }
    /**
     * Alias of unlink.
     * @date 2/28/2024 - 4:58:30 PM
     *
     * @public
     * @async
     * @param {{ path: string, permanent?: boolean }} param0
     * @param {string} param0.path
     * @param {boolean} [param0.permanent=false]
     * @returns {Promise<void>}
     */
    async rm({ path, permanent = false }) {
        return await this._unlink({
            path,
            permanent
        });
    }
    /**
     * Deletes directory at path.
     * @date 2/14/2024 - 2:53:48 AM
     *
     * @public
     * @async
     * @param {...Parameters<typeof this.unlink>} params
     * @returns {Promise<void>}
     */
    async rmdir(...params) {
        return await this._unlink({
            path: params[0].path,
            type: "directory",
            permanent: params[0].permanent
        });
    }
    /**
     * Deletes a file at path.
     *
     * @public
     * @async
     * @param {...Parameters<typeof this.unlink>} params
     * @returns {Promise<void>}
     */
    async rmfile(...params) {
        return await this._unlink({
            path: params[0].path,
            type: "file",
            permanent: params[0].permanent
        });
    }
    /**
     * Read a file. Returns buffer of given length, at position and offset. Memory efficient to read only a small part of a file.
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		offset?: number
     * 		length?: number
     * 		position?: number
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 		onProgressId?: string
     * 	}} param0
     * @param {string} param0.path
     * @param {number} param0.offset
     * @param {number} param0.length
     * @param {number} param0.position
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.onProgress
     * @param {string} param0.onProgressId
     * @returns {Promise<Buffer>}
     */
    async read({ path, offset, length, position, abortSignal, pauseSignal, onProgress, onProgressId }) {
        path = this.normalizePath({ path });
        const uuid = await this.pathToItemUUID({ path });
        const item = this._items[path];
        if (!uuid || !item || item.type === "directory" || (item.type === "file" && item.metadata.key.length === 0)) {
            throw new errors_1.ENOENT({ path });
        }
        if (!position) {
            position = 0;
        }
        if (!length) {
            length = item.metadata.size - 1;
        }
        const stream = this.cloud.downloadFileToReadableStream({
            uuid,
            bucket: item.metadata.bucket,
            region: item.metadata.region,
            size: item.metadata.size,
            chunks: item.metadata.chunks,
            version: item.metadata.version,
            key: item.metadata.key,
            abortSignal,
            pauseSignal,
            onProgress,
            onProgressId,
            start: position,
            end: position + length
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
        if (offset) {
            return buffer.subarray(offset, offset + Math.min(buffer.byteLength, length));
        }
        return buffer;
    }
    /**
     * Alias of writeFile.
     * @date 2/20/2024 - 9:45:40 PM
     *
     * @public
     * @async
     * @param {...Parameters<typeof this.writeFile>} params
     * @returns {Promise<CloudItem>}
     */
    async write(...params) {
        return await this.writeFile(...params);
    }
    /**
     * Read a file at path. Warning: This reads the whole file into memory and can be pretty inefficient.
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 		onProgressId?: string
     * 	}} param0
     * @param {string} param0.path
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.onProgress
     * @param {string} param0.onProgressId
     * @returns {Promise<Buffer>}
     */
    async readFile({ path, abortSignal, pauseSignal, onProgress, onProgressId }) {
        return await this.read({
            path,
            abortSignal,
            pauseSignal,
            onProgress,
            onProgressId
        });
    }
    /**
     * Write to a file. Warning: This reads the whole file into memory and can be very inefficient. Only available in a Node.JS environment.
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		content: Buffer
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback,
     * 		onProgressId?: string
     * 	}} param0
     * @param {string} param0.path
     * @param {Buffer} param0.content
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.onProgress
     * @param {string} param0.onProgressId
     * @returns {Promise<CloudItem>}
     */
    async writeFile({ path, content, abortSignal, pauseSignal, onProgress, onProgressId }) {
        if (constants_1.environment !== "node") {
            throw new Error(`fs.writeFile is not implemented for a ${constants_1.environment} environment`);
        }
        path = this.normalizePath({ path });
        const parentPath = path_1.default.posix.dirname(path);
        let parentUUID = "";
        const fileName = path_1.default.posix.basename(path);
        if (fileName.length === 0 || fileName === "." || fileName === "/") {
            throw new Error("Could not parse file name.");
        }
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
        await fs_extra_1.default.mkdir(path_1.default.join(tmpFilePath, ".."), {
            recursive: true
        });
        await (0, write_file_atomic_1.default)(tmpFilePath, content);
        try {
            const item = await this.cloud.uploadLocalFile({
                source: tmpFilePath,
                parent: parentUUID,
                name: fileName,
                abortSignal,
                pauseSignal,
                onProgress,
                onProgressId
            });
            if (item.type === "file") {
                await this.itemsMutex.acquire();
                this._items[path] = {
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
                this.itemsMutex.release();
            }
            return item;
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
     * Download a file or directory from path to a local destination path. Only available in a Node.JS environment.
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		destination: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 		onProgressId?: string
     * 	}} param0
     * @param {string} param0.path
     * @param {string} param0.destination
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.onProgress
     * @param {string} param0.onProgressId
     * @returns {Promise<void>}
     */
    async download({ path, destination, abortSignal, pauseSignal, onProgress, onProgressId }) {
        if (constants_1.environment !== "node") {
            throw new Error(`fs.download is not implemented for a ${constants_1.environment} environment`);
        }
        path = this.normalizePath({ path });
        destination = (0, utils_1.normalizePath)(destination);
        const uuid = await this.pathToItemUUID({ path });
        const item = this._items[path];
        if (!uuid || !item || (item.type === "file" && item.metadata.key.length === 0)) {
            throw new errors_1.ENOENT({ path });
        }
        if (item.type === "directory") {
            await this.cloud.downloadDirectoryToLocal({
                uuid,
                to: destination,
                abortSignal,
                pauseSignal,
                onProgress,
                onProgressId
            });
            return;
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
            onProgress,
            onProgressId,
            size: item.metadata.size
        });
    }
    /**
     * Upload file or directory to path from a local source path. Recursively creates intermediate directories if needed. Only available in a Node.JS environment.
     *
     * @public
     * @async
     * @param {{
     * 		path: string
     * 		source: string
     * 		overwriteDirectory?: boolean
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 		onProgressId?: string
     * 	}} param0
     * @param {string} param0.path
     * @param {string} param0.source
     * @param {boolean} [param0.overwriteDirectory=false]
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.onProgress
     * @param {string} param0.onProgressId
     * @returns {Promise<CloudItem>}
     */
    async upload({ path, source, overwriteDirectory = false, abortSignal, pauseSignal, onProgress, onProgressId }) {
        if (constants_1.environment !== "node") {
            throw new Error(`fs.upload is not implemented for a ${constants_1.environment} environment`);
        }
        path = this.normalizePath({ path });
        source = (0, utils_1.normalizePath)(source);
        const sourceStat = await fs_extra_1.default.stat(source);
        const parentPath = path_1.default.posix.dirname(path);
        let parentUUID = "";
        const name = path_1.default.posix.basename(path);
        if (name.length === 0 || name === "." || name === "/") {
            throw new Error("Could not parse name.");
        }
        if (parentPath === "/" || parentPath === "." || parentPath === "") {
            parentUUID = this.sdkConfig.baseFolderUUID;
        }
        else {
            await this.mkdir({ path: parentPath });
            const parentItemUUID = await this.pathToItemUUID({ path: parentPath, type: "directory" });
            const parentItem = this._items[parentPath];
            if (!parentItemUUID || !parentItem) {
                throw new Error(`Could not find parent for path ${path}.`);
            }
            parentUUID = parentItem.uuid;
        }
        if (sourceStat.isDirectory()) {
            if (overwriteDirectory) {
                await this._unlink({
                    path,
                    permanent: true,
                    type: "directory"
                });
            }
            await this.cloud.uploadLocalDirectory({
                source,
                parent: parentUUID,
                name,
                abortSignal,
                pauseSignal,
                onProgress,
                onProgressId
            });
            const dir = await this.readdir({
                path: parentPath
            });
            const foundUploadedDir = dir.filter(entry => entry === name && !entry.includes("/"));
            if (!foundUploadedDir[0]) {
                throw new Error("Could not find uploaded directory.");
            }
            const foundUploadedDirStat = await this.stat({ path: path_1.default.posix.join(parentPath, foundUploadedDir[0]) });
            return {
                type: "directory",
                uuid: foundUploadedDirStat.uuid,
                name,
                size: foundUploadedDirStat.size,
                lastModified: foundUploadedDirStat.mtimeMs,
                timestamp: Date.now(),
                parent: parentUUID,
                favorited: false,
                color: null
            };
        }
        else {
            const item = await this.cloud.uploadLocalFile({
                source,
                parent: parentUUID,
                name,
                abortSignal,
                pauseSignal,
                onProgress,
                onProgressId
            });
            if (item.type === "file") {
                await this.itemsMutex.acquire();
                this._items[path] = {
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
                this._uuidToItem[item.uuid] = {
                    uuid: item.uuid,
                    type: "file",
                    path,
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
                this.itemsMutex.release();
            }
            return item;
        }
    }
    /**
     * Copy a file or directory structure. Recursively creates intermediate directories if needed.
     * Warning: Can be really inefficient when copying large directory structures.
     * All files need to be downloaded first and then reuploaded due to our end to end encryption.
     * Plain copying unfortunately does not work. Only available in a Node.JS environment.
     *
     * @public
     * @async
     * @param {{
     * 		from: string
     * 		to: string
     * 		abortSignal?: AbortSignal
     * 		pauseSignal?: PauseSignal
     * 		onProgress?: ProgressCallback
     * 		onProgressId?: string
     * 	}} param0
     * @param {string} param0.from
     * @param {string} param0.to
     * @param {AbortSignal} param0.abortSignal
     * @param {PauseSignal} param0.pauseSignal
     * @param {ProgressCallback} param0.onProgress
     * @param {string} param0.onProgressId
     * @returns {Promise<void>}
     */
    async cp({ from, to, abortSignal, pauseSignal, onProgress, onProgressId }) {
        if (constants_1.environment !== "node") {
            throw new Error(`fs.cp is not implemented for a ${constants_1.environment} environment`);
        }
        from = this.normalizePath({ path: from });
        to = this.normalizePath({ path: to });
        if (from === "/" || from === to || to.startsWith(from + "/")) {
            return;
        }
        const uuid = await this.pathToItemUUID({ path: from });
        const item = this._items[from];
        if (!uuid || !item || (item.type === "file" && item.metadata.key.length === 0)) {
            throw new errors_1.ENOENT({ path: from });
        }
        const parentPath = path_1.default.posix.dirname(to);
        let parentUUID = "";
        if (parentPath === "/" || parentPath === "." || parentPath === "") {
            parentUUID = this.sdkConfig.baseFolderUUID;
        }
        else {
            await this.mkdir({ path: parentPath });
            const parentItemUUID = await this.pathToItemUUID({
                path: parentPath,
                type: "directory"
            });
            const parentItem = this._items[parentPath];
            if (!parentItemUUID || !parentItem) {
                throw new Error(`Could not find parent for path ${to}`);
            }
            parentUUID = parentItem.uuid;
        }
        if (item.type === "directory") {
            const tmpDir = this.sdkConfig.tmpPath ? this.sdkConfig.tmpPath : os_1.default.tmpdir();
            const baseDirectoryName = path_1.default.posix.basename(from);
            if (!baseDirectoryName || baseDirectoryName.length === 0 || baseDirectoryName === ".") {
                throw new Error("Could not parse baseDirectoryName.");
            }
            const newDirectoryName = path_1.default.posix.basename(to);
            if (!newDirectoryName || newDirectoryName.length === 0 || newDirectoryName === ".") {
                throw new Error("Could not parse newDirectoryName.");
            }
            const tmpDirectoryPath = (0, utils_1.normalizePath)(path_1.default.join(tmpDir, "filen-sdk", await (0, utils_1.uuidv4)(), newDirectoryName));
            await this.cloud.downloadDirectoryToLocal({
                uuid,
                to: tmpDirectoryPath
            });
            try {
                await this.cloud.uploadLocalDirectory({
                    source: tmpDirectoryPath,
                    parent: parentUUID,
                    abortSignal,
                    pauseSignal,
                    onProgress,
                    onProgressId,
                    name: newDirectoryName
                });
                await this.readdir({ path: to, recursive: true });
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
            const newFileName = path_1.default.posix.basename(to);
            if (!newFileName || newFileName.length === 0 || newFileName === ".") {
                throw new Error("Could not parse newFileName.");
            }
            const tmpFilePath = await this.cloud.downloadFileToLocal({
                uuid,
                bucket: item.metadata.bucket,
                region: item.metadata.region,
                chunks: item.metadata.chunks,
                version: item.metadata.version,
                key: item.metadata.key,
                abortSignal,
                pauseSignal,
                onProgress,
                onProgressId,
                size: item.metadata.size
            });
            try {
                const uploadedItem = await this.cloud.uploadLocalFile({
                    source: tmpFilePath,
                    parent: parentUUID,
                    abortSignal,
                    pauseSignal,
                    onProgress,
                    onProgressId,
                    name: newFileName
                });
                if (uploadedItem.type === "file") {
                    await this.itemsMutex.acquire();
                    this._items[to] = {
                        uuid: item.uuid,
                        type: "file",
                        metadata: {
                            name: uploadedItem.name,
                            size: uploadedItem.size,
                            mime: uploadedItem.mime,
                            key: uploadedItem.key,
                            lastModified: uploadedItem.lastModified,
                            chunks: uploadedItem.chunks,
                            region: uploadedItem.region,
                            bucket: uploadedItem.bucket,
                            version: uploadedItem.version
                        }
                    };
                    this._uuidToItem[item.uuid] = {
                        uuid: item.uuid,
                        type: "file",
                        path: to,
                        metadata: {
                            name: uploadedItem.name,
                            size: uploadedItem.size,
                            mime: uploadedItem.mime,
                            key: uploadedItem.key,
                            lastModified: uploadedItem.lastModified,
                            chunks: uploadedItem.chunks,
                            region: uploadedItem.region,
                            bucket: uploadedItem.bucket,
                            version: uploadedItem.version
                        }
                    };
                    this.itemsMutex.release();
                }
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
     * @returns {Promise<void>}
     */
    async copy(...params) {
        return await this.cp(...params);
    }
}
exports.FS = FS;
exports.default = FS;
//# sourceMappingURL=index.js.map