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

const filen = new FilenSDK({
	...config,
	authVersion: config.authVersion as AuthVersion
})

const main = async () => {
	console.log("starting")

	console.log(await filen.cloud().getDirectoryTree({ uuid: "443b1ca5-bea1-41f9-950a-05b6f91bdd7e" }))

	console.log("done")
}

main()
