import * as fs from "fs-extra"
import { Transform, pipeline } from "stream"
import { promisify } from "util"
import pathModule from "path"
import { BASE64_BUFFER_SIZE } from "../../constants"

const pipelineAsync = promisify(pipeline)

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
	public _transform(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null, data?: Buffer) => void): void {
		try {
			const decodedChunk = Buffer.from(chunk.toString("utf-8"), "base64")

			this.push(decodedChunk)

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
export async function streamDecodeBase64({ input, output }: { input: string; output: string }): Promise<string> {
	const readStream = fs.createReadStream(pathModule.normalize(input), {
		highWaterMark: BASE64_BUFFER_SIZE
	})
	const writeStream = fs.createWriteStream(pathModule.normalize(output))
	const decodeStream = new Base64DecodeStream()

	await pipelineAsync(readStream, decodeStream, writeStream)

	return output
}
