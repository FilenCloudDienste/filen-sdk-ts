/* eslint-disable quotes */
/* eslint-disable no-constant-condition */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */

import FilenSDK, { UPLOAD_CHUNK_SIZE } from "../src"
import config from "./dev.config.json"
import type { AuthVersion } from "../src/types"
import fs from "fs-extra"
import pathModule from "path"
import { generateRandomString } from "../src/crypto/utils"
import os from "os"
import axios from "axios"
import https from "https"
import { calculateChunkIndices } from "../src/cloud/utils"
import { Readable } from "stream"
import { v4 as uuidv4 } from "uuid"
import { type ReadableStream as ReadableStreamWeb } from "stream/web"
import type Encrypt from "../src/crypto/encrypt"
import { argon2idAsync } from "@noble/hashes/argon2"

const filen = new FilenSDK(
	{
		...config,
		connectToSocket: true,
		metadataCache: true,
		authVersion: config.authVersion as AuthVersion
	},
	undefined,
	axios.create()
)

const main = async () => {
	console.log("starting")

	const derived = Buffer.from(
		await argon2idAsync(await filen.crypto().utils.generateRandomString(256), await filen.crypto().utils.generateRandomString(256), {
			t: 3, // Time cost: 3 iterations
			m: 65536, // Memory cost: 64 MB
			p: 4, // Parallelism: 4
			version: 0x13, // Version 19 (0x13)
			dkLen: 64 // Output length: 64 bytes (512 bits)
		})
	).toString("hex")

	const derivedMasterKeys = derived.substring(0, derived.length / 2)
	const derivedPassword = derived.substring(derived.length / 2, derived.length)

	console.log({ derived, l: derived.length })
	console.log({ derivedMasterKeys, derivedPassword })

	console.log("done")
}

main()
