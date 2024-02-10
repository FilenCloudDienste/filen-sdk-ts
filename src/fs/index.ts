import type API from "../api"
import type Crypto from "../crypto"
import type { FilenSDKConfig } from ".."
import type { FolderMetadata, FileMetadata } from "../types"
import pathModule from "path"
import { ENOENT } from "./errors"
import { convertTimestampToMs } from "../utils"

export type FSConfig = {
	sdkConfig: FilenSDKConfig
	api: API
	crypto: Crypto
}

export type FSItemType = "file" | "directory"

export type FSItemBase = {
	uuid: string
}

export type FSItem =
	| (FSItemBase & {
			type: "directory"
			metadata: FolderMetadata & {
				timestamp: number
			}
	  })
	| (FSItemBase & {
			type: "file"
			metadata: FileMetadata & {
				timestamp: number
			}
	  })

export type FSItems = Record<string, FSItem>

export type FSStats = {
	size: number
	mtimeMs: number
	birthtimeMs: number
	isDirectory: () => boolean
	isFile: () => boolean
}

/**
 * FS
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class FS
 * @typedef {FS}
 */
export class FS {
	private readonly api: API
	private readonly crypto: Crypto
	private readonly sdkConfig: FilenSDKConfig
	private _items: FSItems

	/**
	 * Creates an instance of FS.
	 * @date 2/9/2024 - 5:54:11 AM
	 *
	 * @constructor
	 * @public
	 * @param {FSConfig} params
	 */
	public constructor(params: FSConfig) {
		this.api = params.api
		this.crypto = params.crypto
		this.sdkConfig = params.sdkConfig

		this._items = {
			"/": {
				uuid: this.sdkConfig.baseFolderUUID!,
				type: "directory",
				metadata: {
					name: "Cloud Drive",
					timestamp: 0
				}
			}
		}
	}

	private async pathToDirectoryUUID({ path }: { path: string }): Promise<string | null> {
		if (path.trim() === "/") {
			return this.sdkConfig.baseFolderUUID!
		}

		if (this._items[path]) {
			return this._items[path].uuid
		}

		// @TODO: recursively find UUID for path

		return null
	}

	/**
	 * List files and folders at path.
	 * @date 2/9/2024 - 6:05:44 AM
	 *
	 * @public
	 * @async
	 * @param {{ path: string }} param0
	 * @param {string} param0.path
	 * @returns {Promise<string[]>}
	 */
	public async readdir({ path }: { path: string }): Promise<string[]> {
		const uuid = await this.pathToDirectoryUUID({ path })

		if (!uuid) {
			return []
		}

		if (uuid !== this.sdkConfig.baseFolderUUID!) {
			const present = await this.api.v3().dir().present({ uuid })

			if (!present.present) {
				return []
			}
		}

		const content = await this.api.v3().dir().content({ uuid })
		const items: string[] = []
		const promises: Promise<void>[] = []

		for (const folder of content.folders) {
			promises.push(
				new Promise((resolve, reject) =>
					this.crypto
						.decrypt()
						.folderMetadata({ metadata: folder.name })
						.then(decrypted => {
							items.push(decrypted.name)

							const itemPath = pathModule.posix.join(path, decrypted.name)

							this._items[itemPath] = {
								uuid: folder.uuid,
								type: "directory",
								metadata: {
									name: decrypted.name,
									timestamp: convertTimestampToMs(folder.timestamp)
								}
							}

							resolve()
						})
						.catch(reject)
				)
			)
		}

		for (const file of content.uploads) {
			promises.push(
				new Promise((resolve, reject) =>
					this.crypto
						.decrypt()
						.fileMetadata({ metadata: file.metadata })
						.then(decrypted => {
							items.push(decrypted.name)

							const itemPath = pathModule.posix.join(path, decrypted.name)

							this._items[itemPath] = {
								uuid: file.uuid,
								type: "file",
								metadata: {
									...decrypted,
									timestamp: convertTimestampToMs(file.timestamp)
								}
							}

							resolve()
						})
						.catch(reject)
				)
			)
		}

		await Promise.all(promises)

		return items
	}

	public async stat({ path }: { path: string }): Promise<FSStats> {
		const item = this._items[path]

		if (!item) {
			throw new ENOENT({ path })
		}

		if (item.type === "file") {
			return {
				size: item.metadata.size,
				mtimeMs: item.metadata.lastModified,
				birthtimeMs: item.metadata.creation ?? item.metadata.timestamp,
				isDirectory() {
					return false
				},
				isFile() {
					return true
				}
			}
		}

		return {
			size: 0,
			mtimeMs: item.metadata.timestamp,
			birthtimeMs: item.metadata.timestamp,
			isDirectory() {
				return true
			},
			isFile() {
				return false
			}
		}
	}
}

export default FS
