import { normalizePath } from "../utils"
import fs from "fs-extra"

/**
 * Reads a chunk from a local file.
 * @date 2/16/2024 - 5:45:19 AM
 *
 * @export
 * @param {{ path: string; offset: number; length: number }} param0
 * @param {string} param0.path
 * @param {number} param0.offset
 * @param {number} param0.length
 * @returns {Promise<Buffer>}
 */
export function readLocalFileChunk({ path, offset, length }: { path: string; offset: number; length: number }): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		path = normalizePath(path)

		fs.open(path, "r", (err, fd) => {
			if (err) {
				reject(err)

				return
			}

			const buffer = Buffer.alloc(length)

			fs.read(fd, buffer, 0, length, offset, (err, read) => {
				if (err) {
					fs.close(fd, e => {
						if (err) {
							reject(e)

							return
						}

						reject(err)
					})
				} else {
					let data: Buffer

					if (read < length) {
						data = buffer.subarray(0, read)
					} else {
						data = buffer
					}

					fs.close(fd, err => {
						if (err) {
							reject(err)

							return
						}

						resolve(data)
					})
				}
			})
		})
	})
}

/**
 * Reads a chunk from a web-based file, such as from an <input /> field.
 * @date 2/16/2024 - 5:45:27 AM
 *
 * @export
 * @param {{ file: File; index: number; length: number }} param0
 * @param {File} param0.file
 * @param {number} param0.index
 * @param {number} param0.length
 * @returns {Promise<Buffer>}
 */
export function readWebFileChunk({ file, index, length }: { file: File; index: number; length: number }): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader()

		fileReader.onloadend = () => {
			if (typeof fileReader.result === "string" || fileReader.result === null) {
				resolve(Buffer.from([]))

				return
			}

			resolve(Buffer.from(fileReader.result))
		}

		fileReader.onerror = reject

		const offset = length * index

		fileReader.readAsArrayBuffer(file.slice(offset, offset + length))
	})
}

export const utils = {
	readLocalFileChunk,
	readWebFileChunk
}

export default utils
