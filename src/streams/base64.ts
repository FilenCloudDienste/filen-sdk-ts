import fs from "fs-extra"
import { Transform, pipeline } from "stream"
import { normalizePath } from "../utils"
import { BASE64_BUFFER_SIZE } from "../constants"

/**
 * Base64DecodeStream
 * @date 2/7/2024 - 12:46:12 AM
 *
 * @export
 * @class Base64DecodeStream
 * @typedef {Base64DecodeStream}
 * @extends {Transform}
 */
export class Base64DecodeStream extends Transform {
	/**
	 * Creates an instance of Base64DecodeStream.
	 * @date 2/7/2024 - 12:48:10 AM
	 *
	 * @constructor
	 * @public
	 */
	public constructor() {
		super()
	}

	/**
	 * Custom transform function, decodes each chunk from base64 to a buffer.
	 * @date 2/7/2024 - 12:48:02 AM
	 *
	 * @public
	 * @param {Buffer} chunk
	 * @param {BufferEncoding} encoding
	 * @param {(error?: Error | null, data?: Buffer) => void} callback
	 */
	public _transform(chunk: Buffer, _: BufferEncoding, callback: (error?: Error | null, data?: Buffer) => void): void {
		try {
			this.push(Buffer.from(chunk.toString("utf-8"), "base64"))

			callback()
		} catch (e) {
			callback(e as Error)
		}
	}
}

/**
 * Base64EncodeStream
 * @date 2/10/2024 - 2:55:35 PM
 *
 * @export
 * @class Base64EncodeStream
 * @typedef {Base64EncodeStream}
 * @extends {Transform}
 */
export class Base64EncodeStream extends Transform {
	public constructor() {
		super()
	}

	/**
	 * Custom transform function, encodes each chunk from a buffer to base64.
	 * @date 2/7/2024 - 12:48:02 AM
	 *
	 * @public
	 * @param {Buffer} chunk
	 * @param {BufferEncoding} encoding
	 * @param {(error?: Error | null, data?: Buffer) => void} callback
	 */
	public _transform(chunk: Buffer, _: BufferEncoding, callback: (error?: Error | null, data?: Buffer) => void): void {
		try {
			this.push(chunk.toString("base64"))

			callback()
		} catch (e) {
			callback(e as Error)
		}
	}
}

/**
 * Decodes a base64 input file to an output file using streams.
 * @date 2/7/2024 - 12:47:06 AM
 *
 * @export
 * @async
 * @param {{ input: string; output: string }} param0
 * @param {string} param0.input
 * @param {string} param0.output
 * @returns {Promise<string>}
 */
export async function streamDecodeBase64({ inputFile, outputFile }: { inputFile: string; outputFile: string }): Promise<string> {
	const input = normalizePath(inputFile)
	const output = normalizePath(outputFile)

	if (!(await fs.exists(input))) {
		throw new Error("Input file does not exist.")
	}

	await fs.rm(output, {
		force: true,
		maxRetries: 60 * 10,
		recursive: true,
		retryDelay: 100
	})

	const readStream = fs.createReadStream(input, {
		highWaterMark: BASE64_BUFFER_SIZE
	})
	const writeStream = fs.createWriteStream(output)

	await new Promise<void>((resolve, reject) => {
		pipeline(readStream, new Base64DecodeStream(), writeStream, err => {
			if (err) {
				reject(err)

				return
			}

			resolve()
		})
	})

	return output
}

/**
 * Encodes a input file to an output file in base64 using streams.
 * @date 2/10/2024 - 2:56:34 PM
 *
 * @export
 * @async
 * @param {{ inputFile: string; outputFile: string }} param0
 * @param {string} param0.inputFile
 * @param {string} param0.outputFile
 * @returns {Promise<string>}
 */
export async function streamEncodeBase64({ inputFile, outputFile }: { inputFile: string; outputFile: string }): Promise<string> {
	const input = normalizePath(inputFile)
	const output = normalizePath(outputFile)

	if (!(await fs.exists(input))) {
		throw new Error("Input file does not exist.")
	}

	await fs.rm(output, {
		force: true,
		maxRetries: 60 * 10,
		recursive: true,
		retryDelay: 100
	})

	const readStream = fs.createReadStream(input, {
		highWaterMark: BASE64_BUFFER_SIZE
	})
	const writeStream = fs.createWriteStream(output)

	await new Promise<void>((resolve, reject) => {
		pipeline(readStream, new Base64EncodeStream(), writeStream, err => {
			if (err) {
				reject(err)

				return
			}

			resolve()
		})
	})

	return output
}
