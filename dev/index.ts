/* eslint-disable quotes */
/* eslint-disable no-constant-condition */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */

import FilenSDK, { UPLOAD_CHUNK_SIZE } from "../src"
import config from "./dev.config.json"
import { type AuthVersion } from "../src/types"
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
import { blake2b } from "@noble/hashes/blake2b"
import { sha256 } from "@noble/hashes/sha256"

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

async function main() {
	await filen.fs().writeFile({
		path: "/test/index1.txt",
		content: Buffer.from("hello", "utf-8")
	})
}

main()
