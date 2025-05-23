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
import { sha512 } from "@noble/hashes/sha512"
import { nameSplitter } from "../src/utils"
import nodeCrypto from "crypto"
import { pbkdf2Async } from "@noble/hashes/pbkdf2"

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
	console.log("starting")

	console.log("done")
}

main()
